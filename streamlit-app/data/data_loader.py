"""
Data loader module for the AI Supply Chain Control Tower.
Each dataset independently supports either CSV upload or demo data.
Users can freely mix sources across datasets.
"""

import streamlit as st
import pandas as pd
from typing import Optional, Tuple

from data.data_validator import validate_demand_data, validate_inventory_data, validate_network_data
from data.synthetic_generator import generate_demand_data, generate_inventory_data, generate_network_data


def load_csv_file(uploaded_file) -> Optional[pd.DataFrame]:
    try:
        return pd.read_csv(uploaded_file)
    except Exception as e:
        st.error(f"Failed to read file: {e}")
        return None


def show_data_preview(df: pd.DataFrame, label: str = "Preview"):
    st.markdown(f"**{label}**")
    st.dataframe(df.head(10), use_container_width=True)
    c1, c2, c3 = st.columns(3)
    c1.metric("Rows", f"{len(df):,}")
    c2.metric("Columns", len(df.columns))
    c3.metric("Missing Values", f"{df.isnull().sum().sum():,}")


def show_summary_statistics(df: pd.DataFrame):
    numeric_df = df.select_dtypes(include="number")
    if not numeric_df.empty:
        with st.expander("Summary Statistics"):
            st.dataframe(numeric_df.describe().round(2), use_container_width=True)


def _status_badge(session_key: str, label: str):
    """Show a small badge indicating what data source is currently loaded."""
    source = st.session_state.get(f"{session_key}_source")
    if source == "upload":
        st.success(f"{label} loaded from uploaded file")
    elif source == "demo":
        st.info(f"{label} loaded from demo data")


def upload_demand_data() -> Tuple[Optional[pd.DataFrame], bool]:
    st.markdown("### Demand Dataset")
    st.caption("Required columns: `date`, `product_id`, `sales`")

    _status_badge("demand", "Demand data")

    tab_upload, tab_demo = st.tabs(["Upload CSV", "Use Demo Data"])

    # ── Upload tab ──────────────────────────────────────────────────────────
    with tab_upload:
        template_csv = "date,product_id,sales\n2024-01-01,PROD-001,150\n2024-01-02,PROD-001,165\n"
        st.download_button("Download CSV Template", data=template_csv,
                           file_name="demand_template.csv", mime="text/csv",
                           key="dl_demand_tpl")

        uploaded = st.file_uploader("Upload your demand CSV file", type=["csv"],
                                    key="upload_demand",
                                    help="Must contain: date, product_id, sales")
        if uploaded is not None:
            df = load_csv_file(uploaded)
            if df is not None:
                is_valid, messages = _validate_and_show(df, validate_demand_data)
                if is_valid:
                    show_data_preview(df, "Uploaded Demand Data")
                    show_summary_statistics(df)
                    st.session_state["demand_loaded"] = df
                    st.session_state["demand_source"] = "upload"

    # ── Demo tab ─────────────────────────────────────────────────────────────
    with tab_demo:
        st.markdown("Generate realistic synthetic demand data for testing.")
        c1, c2 = st.columns(2)
        n_products = c1.slider("Number of Products", 2, 10, 5, key="n_prod_demand")
        n_days = c2.slider("History Days", 90, 730, 365, key="n_days_demand")

        if st.button("Generate Demo Demand Data", key="gen_demand"):
            df = generate_demand_data(n_products=n_products, n_days=n_days)
            is_valid, _ = _validate_and_show(df, validate_demand_data)
            if is_valid:
                show_data_preview(df, "Demo Demand Data")
                show_summary_statistics(df)
                st.session_state["demand_loaded"] = df
                st.session_state["demand_source"] = "demo"
        elif st.session_state.get("demand_source") == "demo" and st.session_state.get("demand_loaded") is not None:
            show_data_preview(st.session_state["demand_loaded"], "Demo Demand Data (current)")

    loaded = st.session_state.get("demand_loaded")
    return (loaded, loaded is not None)


def upload_inventory_data() -> Tuple[Optional[pd.DataFrame], bool]:
    st.markdown("### Inventory Dataset")
    st.caption("Required columns: `product_id`, `warehouse_id`, `current_inventory`, `holding_cost`, `ordering_cost`, `lead_time_days`, `service_level_target`")

    _status_badge("inventory", "Inventory data")

    tab_upload, tab_demo = st.tabs(["Upload CSV", "Use Demo Data"])

    with tab_upload:
        template_csv = (
            "product_id,warehouse_id,current_inventory,holding_cost,ordering_cost,lead_time_days,service_level_target\n"
            "PROD-001,WH-001,500,2.5,100,7,0.95\n"
            "PROD-002,WH-001,200,1.8,80,10,0.90\n"
        )
        st.download_button("Download CSV Template", data=template_csv,
                           file_name="inventory_template.csv", mime="text/csv",
                           key="dl_inv_tpl")

        uploaded = st.file_uploader("Upload your inventory CSV file", type=["csv"],
                                    key="upload_inv")
        if uploaded is not None:
            df = load_csv_file(uploaded)
            if df is not None:
                is_valid, _ = _validate_and_show(df, validate_inventory_data)
                if is_valid:
                    show_data_preview(df, "Uploaded Inventory Data")
                    show_summary_statistics(df)
                    st.session_state["inventory_loaded"] = df
                    st.session_state["inventory_source"] = "upload"

    with tab_demo:
        st.markdown("Generate realistic synthetic inventory data for testing.")
        c1, c2 = st.columns(2)
        n_products = c1.slider("Number of Products", 2, 10, 5, key="n_prod_inv")
        n_warehouses = c2.slider("Number of Warehouses", 1, 5, 3, key="n_wh_inv")

        if st.button("Generate Demo Inventory Data", key="gen_inv"):
            df = generate_inventory_data(n_products=n_products, n_warehouses=n_warehouses)
            is_valid, _ = _validate_and_show(df, validate_inventory_data)
            if is_valid:
                show_data_preview(df, "Demo Inventory Data")
                show_summary_statistics(df)
                st.session_state["inventory_loaded"] = df
                st.session_state["inventory_source"] = "demo"
        elif st.session_state.get("inventory_source") == "demo" and st.session_state.get("inventory_loaded") is not None:
            show_data_preview(st.session_state["inventory_loaded"], "Demo Inventory Data (current)")

    loaded = st.session_state.get("inventory_loaded")
    return (loaded, loaded is not None)


def upload_network_data() -> Tuple[Optional[pd.DataFrame], bool]:
    st.markdown("### Supply Chain Network Dataset")
    st.caption("Required columns: `source_node`, `destination_node`, `transport_cost`, `lead_time_days`, `capacity`, `node_type`")

    _status_badge("network", "Network data")

    tab_upload, tab_demo = st.tabs(["Upload CSV", "Use Demo Data"])

    with tab_upload:
        template_csv = (
            "source_node,destination_node,transport_cost,lead_time_days,capacity,node_type\n"
            "SUPPLIER-001,FACTORY-001,500,5,1000,supplier\n"
            "FACTORY-001,WH-001,300,3,1200,factory\n"
            "WH-001,RETAILER-001,150,2,600,warehouse\n"
        )
        st.download_button("Download CSV Template", data=template_csv,
                           file_name="network_template.csv", mime="text/csv",
                           key="dl_net_tpl")

        st.markdown("**Node types:** `supplier`, `factory`, `warehouse`, `retailer`")

        uploaded = st.file_uploader("Upload your network CSV file", type=["csv"],
                                    key="upload_net")
        if uploaded is not None:
            df = load_csv_file(uploaded)
            if df is not None:
                is_valid, _ = _validate_and_show(df, validate_network_data)
                if is_valid:
                    show_data_preview(df, "Uploaded Network Data")
                    st.session_state["network_loaded"] = df
                    st.session_state["network_source"] = "upload"

    with tab_demo:
        st.markdown("Generate a realistic synthetic supply chain network for testing.")

        if st.button("Generate Demo Network Data", key="gen_net"):
            df = generate_network_data()
            is_valid, _ = _validate_and_show(df, validate_network_data)
            if is_valid:
                show_data_preview(df, "Demo Network Data")
                st.session_state["network_loaded"] = df
                st.session_state["network_source"] = "demo"
        elif st.session_state.get("network_source") == "demo" and st.session_state.get("network_loaded") is not None:
            show_data_preview(st.session_state["network_loaded"], "Demo Network Data (current)")

    loaded = st.session_state.get("network_loaded")
    return (loaded, loaded is not None)


def _validate_and_show(df: pd.DataFrame, validator_fn) -> Tuple[bool, list]:
    """Run a validator and display messages. Returns (is_valid, messages)."""
    is_valid, messages = validator_fn(df)
    for msg in messages:
        if is_valid:
            st.success(msg)
        else:
            st.error(msg)
    return is_valid, messages
