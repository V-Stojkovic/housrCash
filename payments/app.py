import streamlit as st
import requests

st.title("Payment Generator")

user_id = st.text_input("User ID")
reference = st.text_input("Reference")
amount = st.text_input("Amount in GBP")


if st.button("Generate Payment Event"):
    # 1. Validate inputs.
    if not (user_id and reference and amount):
        st.toast("⚠️ All fields are required. Please fill them in.", icon="⚠️")
    else:
        try:
            amount = float(amount)
            if amount <= 0:
                st.toast("⚠️ Amount must be a positive number.", icon="⚠️")
            else:
                # 2. On success, generate the event.
                payment_data = {"user_id": user_id,
                                "reference": reference, "amount": amount}
                st.json(payment_data)

                # 3. Send the payment data to the backend API.
                try:
                    response = requests.post("http://localhost:4000/api/v0/payment", json=payment_data)
                    if response.status_code == 200:
                        st.success("Payment processed successfully!")
                    else:
                        st.error("Failed to process payment.")
                except requests.RequestException as e:
                    st.error(f"An error occurred: {e}")
                

        except ValueError:
            st.toast("⚠️ Invalid amount. Please enter a valid number.", icon="⚠️")
