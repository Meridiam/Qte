package com.example.android.frontend;

import android.app.Activity;

import android.content.Intent;
import android.graphics.Camera;
import android.graphics.PointF;
import android.hardware.camera2.CameraDevice;
import android.os.Bundle;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.SurfaceView;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.zxing.Result;

import java.util.HashMap;
import java.util.Map;

import me.dm7.barcodescanner.zxing.ZXingScannerView;

import static com.example.android.frontend.R.id.username;


public class ScanQRCode extends Activity implements ZXingScannerView.ResultHandler {
    private ZXingScannerView mScannerView;
    private String username;
    private String resultURL;

    @Override
    protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_scan_qrcode);
        username = getIntent().getStringExtra("username");
    }

    public void onClick(View v){
        mScannerView = new ZXingScannerView(this);
        setContentView(mScannerView);
        mScannerView.setResultHandler(this);
        mScannerView.startCamera();
    }

    @Override
    protected void onPause(){
        super.onPause();
        mScannerView.stopCamera();
    }

    @Override
    public void handleResult(Result result){
        Log.v("handleResult", result.getText());
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Scan Result");
        builder.setMessage(result.getText());
        resultURL = result.getText().toString();
//        AlertDialog alertDialog = builder.create();
//        alertDialog.show();

        postJsonRequest();

        Intent i = new Intent(ScanQRCode.this, RecieptActivity.class);
        i.putExtra("resultURL", resultURL);
        startActivity(i);
    }

    private void postJsonRequest(){
        RequestQueue queue = Volley.newRequestQueue(this);
        String url = resultURL;
        StringRequest postRequest = new StringRequest(Request.Method.POST, url,
                new Response.Listener<String>()
                {
                    @Override
                    public void onResponse(String response) {
                        // response
                        Log.d("Response", response);
                    }
                },
                new Response.ErrorListener()
                {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        // error
                        Log.d("Error.Response", error.toString());
                    }
                }
        ) {
            @Override
            protected Map<String, String> getParams()
            {
                Map<String, String>  params = new HashMap<String, String>();
                params.put("username", username);
                return params;
            }
        };
        queue.add(postRequest);
    }
}