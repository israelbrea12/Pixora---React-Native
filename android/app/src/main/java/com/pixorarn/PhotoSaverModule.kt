// android/app/src/main/java/com/pixorarn/PhotoSaverModule.kt
package com.pixorarn

import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.provider.MediaStore
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.squareup.picasso.Picasso
import com.squareup.picasso.Target
import java.lang.Exception

// La declaración de la clase y el constructor son más concisos en Kotlin
class PhotoSaverModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    // override fun en lugar de @Override public String
    override fun getName() = "PhotoSaver"

    @ReactMethod
    fun savePhoto(urlString: String, promise: Promise) {
        // La lógica interna es la misma, pero la implementación de la interfaz 'Target'
        // se hace con 'object : Target' en Kotlin.
        Picasso.get().load(urlString).into(object : Target {
            override fun onBitmapLoaded(bitmap: Bitmap?, from: Picasso.LoadedFrom?) {
                try {
                    MediaStore.Images.Media.insertImage(
                        reactApplicationContext.contentResolver,
                        bitmap,
                        "Photo from Pixora",
                        "Saved via Pixora App"
                    )
                    promise.resolve("La foto se ha guardado en tu galería.")
                } catch (e: Exception) {
                    promise.reject("SAVE_ERROR", e)
                }
            }

            override fun onBitmapFailed(e: Exception?, errorDrawable: Drawable?) {
                promise.reject("DOWNLOAD_ERROR", e)
            }

            override fun onPrepareLoad(placeHolderDrawable: Drawable?) {}
        })
    }
}