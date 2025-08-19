package com.pixorarn

import com.bumptech.glide.Glide // Importamos Glide para cargar imágenes desde URL
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class DoubleTapImageViewManager : SimpleViewManager<DoubleTapImageView>() {

    // Nombre que usaremos en React Native: <DoubleTapImageView ... />
    override fun getName(): String = "DoubleTapImageView"

    override fun createViewInstance(reactContext: ThemedReactContext): DoubleTapImageView {
        return DoubleTapImageView(reactContext)
    }

    // Exponemos una prop "imageUrl" para pasar la URL de la imagen desde JS
    @ReactProp(name = "imageUrl")
    fun setImageUrl(view: DoubleTapImageView, url: String?) {
        if (url != null) {
            Glide.with(view.context)
                .load(url)
                .into(view)
        }
    }

    // Exponemos el evento "onDoubleTap" a React Native
    override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any> {
        return MapBuilder.builder<String, Any>()
            .put(
                "doubleTap",
                MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", "onDoubleTap")
                )
            )
            .build()
    }
}