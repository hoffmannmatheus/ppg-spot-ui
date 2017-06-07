package com.paramotor_spots;

import android.support.annotation.NonNull;
import android.widget.LinearLayout;

import com.facebook.react.modules.core.PermissionListener;
import com.imagepicker.permissions.OnImagePickerPermissionsCallback;
import com.reactnativenavigation.controllers.SplashActivity;

public class MainActivity extends SplashActivity implements OnImagePickerPermissionsCallback {

    private PermissionListener mListener;

    @Override
    public LinearLayout createSplashLayout() {
        return (LinearLayout) getLayoutInflater().inflate(R.layout.splash, null);
    }

    @Override
    public void setPermissionListener(@NonNull PermissionListener listener) {
        mListener = listener;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (mListener != null) {
            mListener.onRequestPermissionsResult(requestCode, permissions, grantResults);
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }
}
