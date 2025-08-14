// android/app/src/main/java/com/pixorarn/PhotoSaverModule.kt
package com.pixorarn

import android.content.ContentValues
import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.os.Build
import android.provider.MediaStore
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.squareup.picasso.Picasso
import com.squareup.picasso.Target
import java.io.OutputStream
import java.lang.Exception

class PhotoSaverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "PhotoSaver"

    @ReactMethod
    fun savePhoto(urlString: String, promise: Promise) {
        // Obtenemos la actividad actual para poder usar runOnUiThread
        val activity = currentActivity

        if (activity == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "La actividad actual no está disponible.")
            return
        }

        // ✅ LA SOLUCIÓN: Ejecutar Picasso en el Hilo Principal (UI Thread)
        activity.runOnUiThread {
            Picasso.get().load(urlString).into(object : Target {

                // Este callback se ejecuta en el HILO PRINCIPAL por Picasso
                override fun onBitmapLoaded(bitmap: Bitmap?, from: Picasso.LoadedFrom?) {
                    if (bitmap == null) {
                        promise.reject("DOWNLOAD_ERROR", "El bitmap descargado es nulo.")
                        return
                    }

                    // Tu lógica para guardar en un hilo secundario ya era CORRECTA. ¡Bien hecho!
                    // La mantenemos exactamente igual.
                    Thread {
                        try {
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
                                return@Thread
                            }

                            val stream: OutputStream? = resolver.openOutputStream(imageUri)
                            if (stream == null) {
                                promise.reject("SAVE_ERROR", "No se pudo abrir el stream para guardar la imagen.")
                                return@Thread
                            }

                            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream)
                            stream.flush()
                            stream.close()

                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                                imageDetails.clear()
                                imageDetails.put(MediaStore.Images.Media.IS_PENDING, 0)
                                resolver.update(imageUri, imageDetails, null, null)
                            }

                            promise.resolve("¡Foto guardada en la galería! 🎉")

                        } catch (e: Exception) {
                            promise.reject("SAVE_ERROR", "Error al guardar la imagen: ${e.message}", e)
                        }
                    }.start()
                }

                override fun onBitmapFailed(e: Exception?, errorDrawable: Drawable?) {
                    promise.reject("DOWNLOAD_ERROR", "No se pudo descargar la imagen.", e)
                }

                override fun onPrepareLoad(placeHolderDrawable: Drawable?) {}
            })
        }
    }
}