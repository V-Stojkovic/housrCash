import streamlit as st
import requests

st.title("Payment Generator")

user_name = st.text_input("Username")
reference = st.text_input("Reference")
amount = st.text_input("Amount in GBP")


if st.button("Generate Payment Event"):
    # 1. Validate inputs.
    if not (user_name and reference and amount):
        st.toast("⚠️ All fields are required. Please fill them in.", icon="⚠️")
    else:
        try:
            amount = float(amount)
            if amount <= 0:
                st.toast("⚠️ Amount must be a positive number.", icon="⚠️")
            else:
                # 2. On success, generate the event.
                payment_data = {"username": user_name,
                                "reference": reference, "amount": amount}
                st.json(payment_data)

                # 3. Send the payment data to the backend API.
                try:
                    response = requests.post("http://localhost:8080/api/v0/payments", json=payment_data)
                    if response.status_code == 200:
                        st.success("Payment processed successfully!")
                    else:
                        st.error("Failed to process payment.")
                except requests.RequestException as e:
                    st.error(f"An error occurred: {e}")
                

        except ValueError:
            st.toast("⚠️ Invalid amount. Please enter a valid number.", icon="⚠️")
