package com.pixorarn

import android.content.Context
import android.view.GestureDetector
import android.view.MotionEvent
import androidx.appcompat.widget.AppCompatImageView
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

// Cambiamos AppCompatTextView por AppCompatImageView para manejar imágenes
class DoubleTapImageView(context: Context) : AppCompatImageView(context),
    GestureDetector.OnGestureListener,
    GestureDetector.OnDoubleTapListener {

    private val gestureDetector = GestureDetector(context, this).apply {
        setOnDoubleTapListener(this@DoubleTapImageView)
    }

    // Pasamos los eventos de toque a nuestro detector de gestos
    override fun onTouchEvent(event: MotionEvent?): Boolean {
        if (event != null && gestureDetector.onTouchEvent(event)) {
            return true
        }
        return super.onTouchEvent(event)
    }

    // Cuando se detecta un doble toque, emitimos un evento a React Native
    override fun onDoubleTap(e: MotionEvent): Boolean {
        val reactContext = context as ReactContext
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(
            id,
            "doubleTap", // Nombre del evento
            null
        )
        return true
    }

    // Métodos requeridos por la interfaz GestureDetector, podemos dejarlos como están
    override fun onDown(e: MotionEvent): Boolean = true
    override fun onFling(e1: MotionEvent?, e2: MotionEvent, velocityX: Float, velocityY: Float): Boolean = true
    override fun onLongPress(e: MotionEvent) {}
    override fun onScroll(e1: MotionEvent?, e2: MotionEvent, distanceX: Float, distanceY: Float): Boolean = true
    override fun onShowPress(e: MotionEvent) {}
    override fun onSingleTapUp(e: MotionEvent): Boolean = true
    override fun onDoubleTapEvent(e: MotionEvent): Boolean = true
    override fun onSingleTapConfirmed(e: MotionEvent): Boolean = true
}