import React  from 'react';
import { PayPalScriptProvider, 
        PayPalButtons } from "@paypal/react-paypal-js";

const PaypalOptions = {
    "client-id": "AWvTwUEn-RV3xGFwsuBHc6DJ1KDP5oiTtwBsOv6Yj4Z0mfx0OEM99S0nopTv0sFUEMZUGRuyOxsAt6vd",
    "currency": "USD",
    "intent": "capture"
  };
  
  const PaypalStyle = {
    layout: "vertical",
    shape: "pill"
  };

const PaypalCheckoutButton = ({product, handleApprove}) => {

    return (
        <PayPalScriptProvider options={PaypalOptions}>
        <PayPalButtons 
            style={PaypalStyle}
            forceReRender={[product.amount, product.description]}
            createOrder = {
                async (data, actions) => {
                    return actions.order.create({
                        purchase_units:[
                            {
                                description: product.description,
                                amount: {
                                    value: product.amount
                                }
                            }
                        ]
                    })
                }
          }
            onApprove = { async (data, actions) => {
                console.log("onApprove Data:", data);
                const orderDetails = await actions.order.capture();
                handleApprove(orderDetails);
            }}
            onError={(err) => {
                console.log(err);
            }
          }
        />
        </PayPalScriptProvider>
    )
}

export default PaypalCheckoutButton;