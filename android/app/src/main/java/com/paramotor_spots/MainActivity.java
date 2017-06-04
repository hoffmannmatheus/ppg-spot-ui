package com.paramotor_spots;

import android.widget.LinearLayout;

import com.reactnativenavigation.controllers.SplashActivity;

public class MainActivity extends SplashActivity {
    @Override
    public LinearLayout createSplashLayout() {
        return (LinearLayout) getLayoutInflater().inflate(R.layout.splash, null);
    }
}
