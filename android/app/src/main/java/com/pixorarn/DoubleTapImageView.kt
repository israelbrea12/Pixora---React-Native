package com.pixorarn

import android.content.Context
import android.view.GestureDetector
import android.view.MotionEvent
import androidx.appcompat.widget.AppCompatImageView
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

class DoubleTapImageView(context: Context) : AppCompatImageView(context),
    GestureDetector.OnGestureListener,
    GestureDetector.OnDoubleTapListener {

    private val gestureDetector = GestureDetector(context, this).apply {
        setOnDoubleTapListener(this@DoubleTapImageView)
    }

    override fun onTouchEvent(event: MotionEvent?): Boolean {
        if (event != null && gestureDetector.onTouchEvent(event)) {
            return true
        }
        return super.onTouchEvent(event)
    }

    override fun onDoubleTap(e: MotionEvent): Boolean {
        val reactContext = context as ReactContext
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(
            id,
            "doubleTap",
            null
        )
        return true
    }

    override fun onDown(e: MotionEvent): Boolean = true
    override fun onFling(e1: MotionEvent?, e2: MotionEvent, velocityX: Float, velocityY: Float): Boolean = true
    override fun onLongPress(e: MotionEvent) {}
    override fun onScroll(e1: MotionEvent?, e2: MotionEvent, distanceX: Float, distanceY: Float): Boolean = true
    override fun onShowPress(e: MotionEvent) {}
    override fun onSingleTapUp(e: MotionEvent): Boolean = true
    override fun onDoubleTapEvent(e: MotionEvent): Boolean = true
    override fun onSingleTapConfirmed(e: MotionEvent): Boolean = true
}