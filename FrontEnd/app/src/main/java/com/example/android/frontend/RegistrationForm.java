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
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class RegistrationForm extends AppCompatActivity {

    private String customerId;
    private String email;
    private String username;
    private String password;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registration_form);

        customerId = getIntent().getStringExtra("product");

//        TextView cID = (EditText) findViewById(R.id.customer_id);
//        customerId = cID.getText() + "";

        Button confirmButton= (Button) findViewById(R.id.confirm);
        confirmButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                //put what your gonna send to jerry here
                EditText mUsername = (EditText) findViewById(R.id.username);
                EditText mPassword = (EditText) findViewById(R.id.password);

                username = mUsername.getText() + "";
                password = mPassword.getText() + "";

                Log.d("CustomerID", customerId);
                Log.d("Username", username);
                Log.d("Password", password);

                postJsonRequest();

                Intent i = new Intent(RegistrationForm.this, MainActivity.class);

                i.putExtra("username", username);
                i.putExtra("password", password);
                startActivity(i);
            }
        });
    }

    private void postJsonRequest(){
        RequestQueue queue = Volley.newRequestQueue(this);
        String url = "http://qte-env.upxqgrh3im.us-east-1.elasticbeanstalk.com/pay/";
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
                params.put("password", password);
                params.put("bankID", customerId);

                return params;
            }
        };
        queue.add(postRequest);
    }
}