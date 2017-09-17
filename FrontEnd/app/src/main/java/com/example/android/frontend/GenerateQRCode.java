package com.example.android.frontend;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;

import net.glxn.qrgen.android.QRCode;

import static com.example.android.frontend.R.id.generated_qr_code;

public class GenerateQRCode extends AppCompatActivity {

    private String username;
    private String password;
    private EditText amount;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_generate_qrcode);

        username = getIntent().getStringExtra("username");
        password = getIntent().getStringExtra("password");
        amount = (EditText) findViewById(R.id.input_amount);

        Button registerButton= (Button) findViewById(R.id.confirm_button);
        registerButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {

                Bitmap myBitmap = QRCode.from("http://qte-env.upxqgrh3im.us-east-1.elasticbeanstalk.com/pay/"+ username + "/" + amount.getText().toString()).withSize(700, 700).bitmap();

                ImageView myImage = (ImageView) findViewById(R.id.generated_qr_code);
                myImage.setImageBitmap(myBitmap);
            }
        });

        Button doneButton= (Button) findViewById(R.id.done_button);
        doneButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                Intent i = new Intent(GenerateQRCode.this, MainActivity.class);
                startActivity(i);
            }
        });
    }
}
