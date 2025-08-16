// android/app/src/main/java/com/pixorarn/PhotoSaverModule.kt
package com.pixorarn

import android.content.ContentValues
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.provider.MediaStore
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.IOException
import java.io.OutputStream
import java.net.URL

class PhotoSaverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    // Creamos un "scope" de coroutines que se ejecuta en un hilo de fondo (IO).
    // Esto es ideal para operaciones de red y de disco.
    private val moduleScope = CoroutineScope(Dispatchers.IO)

    override fun getName() = "PhotoSaver"

    @ReactMethod
    fun savePhoto(urlString: String, promise: Promise) {
        // Lanzamos una nueva coroutine en nuestro scope de fondo.
        // Todo lo que está dentro de 'launch' ya no bloquea el hilo principal.
        moduleScope.launch {
            try {
                // 1. Descargar la imagen directamente (sin Picasso)
                val url = URL(urlString)
                val bitmap: Bitmap?
                // 'use' se encarga de cerrar el stream automáticamente
                url.openStream().use { inputStream ->
                    bitmap = BitmapFactory.decodeStream(inputStream)
                }

                if (bitmap == null) {
                    promise.reject("DOWNLOAD_ERROR", "El bitmap descargado es nulo.")
                    return@launch
                }

                // 2. Guardar el bitmap en la galería (tu lógica de guardado era perfecta)
                val resolver = reactApplicationContext.contentResolver
                val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                } else {
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                }

                val imageDetails = ContentValues().apply {
                    put(MediaStore.Images.Media.DISPLAY_NAME, "Photo_${System.currentTimeMillis()}.jpg")
                    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        put(MediaStore.Images.Media.IS_PENDING, 1)
                    }
                }

                val imageUri = resolver.insert(collection, imageDetails)
                if (imageUri == null) {
                    promise.reject("SAVE_ERROR", "No se pudo crear la entrada en la galería.")
                    return@launch
                }

                val stream: OutputStream? = resolver.openOutputStream(imageUri)
                if (stream == null) {
                    promise.reject("SAVE_ERROR", "No se pudo abrir el stream para guardar la imagen.")
                    return@launch
                }

                // Usamos 'use' también aquí para asegurar que el stream se cierre
                stream.use {
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, it)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    imageDetails.clear()
                    imageDetails.put(MediaStore.Images.Media.IS_PENDING, 0)
                    resolver.update(imageUri, imageDetails, null, null)
                }

                promise.resolve("¡Foto guardada en la galería! 🎉")

            } catch (e: IOException) {
                // Error de red o al decodificar la imagen
                promise.reject("DOWNLOAD_ERROR", "No se pudo descargar o decodificar la imagen: ${e.message}", e)
            } catch (e: Exception) {
                // Cualquier otro error durante el guardado
                promise.reject("SAVE_ERROR", "Error al guardar la imagen: ${e.message}", e)
            }
        }
    }
}