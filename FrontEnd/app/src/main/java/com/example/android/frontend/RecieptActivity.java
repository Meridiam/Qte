package com.example.android.frontend;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import java.util.Calendar;
import java.util.Date;

import static com.example.android.frontend.R.id.username;

public class RecieptActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reciept);

        TextView date=(TextView)findViewById(R.id.date_of_purchase);
        Date currentTime = Calendar.getInstance().getTime();
        date.setText(date.getText()+currentTime.toString());

        String resultURL = getIntent().getStringExtra("resultURL");
        String[] stuff = resultURL.split("/");

        TextView amount = (TextView) findViewById(R.id.amount_paid);
        amount.append(" $" + stuff[stuff.length - 1]);

        TextView user = (TextView) findViewById(R.id.person_reciving_money);
        user.append(" " + stuff[stuff.length - 2]);
        Button homeButton= (Button) findViewById(R.id.return_to_home_button);
        homeButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                Intent i = new Intent(RecieptActivity.this, MainActivity.class);
                startActivity(i);
            }
        });
    }
}
