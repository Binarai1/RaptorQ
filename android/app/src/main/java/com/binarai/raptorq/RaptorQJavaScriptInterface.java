package com.binarai.raptorq;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

public class RaptorQJavaScriptInterface {
    private Context context;
    
    public RaptorQJavaScriptInterface(Context context) {
        this.context = context;
    }
    
    @JavascriptInterface
    public void showToast(String message) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
    }
    
    @JavascriptInterface
    public void showLongToast(String message) {
        Toast.makeText(context, message, Toast.LENGTH_LONG).show();
    }
    
    @JavascriptInterface
    public void vibrate(int milliseconds) {
        try {
            Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                vibrator.vibrate(milliseconds);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @JavascriptInterface
    public void shareText(String text, String subject) {
        try {
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_TEXT, text);
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, subject);
            
            Intent chooser = Intent.createChooser(shareIntent, "Share via");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(chooser);
        } catch (Exception e) {
            showToast("Unable to share");
        }
    }
    
    @JavascriptInterface
    public void openUrl(String url) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception e) {
            showToast("Unable to open URL");
        }
    }
    
    @JavascriptInterface
    public String getDeviceInfo() {
        return "RaptorQ Android Wallet v1.0";
    }
    
    @JavascriptInterface
    public boolean isNativeApp() {
        return true;
    }
    
    @JavascriptInterface
    public void hapticFeedback() {
        vibrate(50); // Short vibration for haptic feedback
    }
}