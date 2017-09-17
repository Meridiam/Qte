package com.example.android.frontend;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.TextView;

import java.util.Calendar;
import java.util.Date;

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
    }
}
