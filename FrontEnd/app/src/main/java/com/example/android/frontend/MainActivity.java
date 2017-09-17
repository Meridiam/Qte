package com.example.android.frontend;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private TextView balance;
    private String username;
    private String password;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        username = getIntent().getStringExtra("username");
        password = getIntent().getStringExtra("password");
        balance = (TextView) findViewById(R.id.balance);
        getBalance();

        Button genButton= (Button) findViewById(R.id.generate_qr_code);
        genButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                Intent i = new Intent(MainActivity.this, GenerateQRCode.class);

                i.putExtra("username", username);
                i.putExtra("password", password);
                startActivity(i);
            }
        });

        Button scanButton= (Button) findViewById(R.id.scan_qr_code);
        scanButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                Intent i = new Intent(MainActivity.this, ScanQRCode.class);

                i.putExtra("username", username);
                startActivity(i);
            }
        });
    }

    private void getBalance(){
        RequestQueue queue = Volley.newRequestQueue(this);
        String url = "http://qte-env.upxqgrh3im.us-east-1.elasticbeanstalk.com/data/" + username;

        JsonObjectRequest getRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>()
                {
                    @Override
                    public void onResponse(JSONObject response) {
                        Log.d("Response", response.toString());
                        try {//59bc84eca73e4942cdafdcd3
                            int bal = response.getInt("balance");
                            Log.d("balll", "$" + bal);
                            balance.append(" $" + bal);
                        } catch (JSONException e) {
//                            e.printStackTrace();
//                            Toast.makeText(getApplicationContext(),
//                                    "Error: " + e.getMessage(),
//                                    Toast.LENGTH_LONG).show();
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
//                        Log.e("LOG", error.toString());
                    }
                }
        );

        queue.add(getRequest);
    }
}
