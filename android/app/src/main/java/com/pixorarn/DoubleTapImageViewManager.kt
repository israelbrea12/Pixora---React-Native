package com.pixorarn

import com.bumptech.glide.Glide 
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class DoubleTapImageViewManager : SimpleViewManager<DoubleTapImageView>() {

    override fun getName(): String = "DoubleTapImageView"

    override fun createViewInstance(reactContext: ThemedReactContext): DoubleTapImageView {
        return DoubleTapImageView(reactContext)
    }

    @ReactProp(name = "imageUrl")
    fun setImageUrl(view: DoubleTapImageView, url: String?) {
        if (url != null) {
            Glide.with(view.context)
                .load(url)
                .into(view)
        }
    }

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