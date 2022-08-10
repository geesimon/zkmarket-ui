import React , {useEffect} from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PaypalOptions = {
    "client-id": "AWvTwUEn-RV3xGFwsuBHc6DJ1KDP5oiTtwBsOv6Yj4Z0mfx0OEM99S0nopTv0sFUEMZUGRuyOxsAt6vd",
    "currency": "USD",
    "intent": "capture"
  };
  
  const PaypalStyle = {
    layout: "vertical",
    shape: "pill"
  };

const PaypalCheckoutButton = ({product}) => {
    let amountValue;

    const handleApprove = (orderId) => {
        //call backend function to fullfill order
        // if response is success 
        // setPaidFor(true);
    }

    // useEffect(() => {
    //     amountValue = product.amountValue
    //     console.log("rerender", product);
    // }, [product]);

    return (
        <PayPalScriptProvider options={PaypalOptions}>
        <PayPalButtons 
          style={PaypalStyle} 
          createOrder = {
            (data, actions) => {
                console.log("amount", product.amountValue);

              return actions.order.create({
                purchase_units:[
                  {
                    description: product.description,
                    amount: {
                      value: product.amountValue
                    }
                  }
                ]
              })
            }
          }
          onApprove={async (data, actions) => {
            const order = await actions.order.capture();
            console.log("order", order);
            handleApprove(data.orderID);
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