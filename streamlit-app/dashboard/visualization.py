"""
Dashboard visualization module for the AI Supply Chain Control Tower.
All Plotly charts and Streamlit dashboard sections.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import networkx as nx
from typing import Dict, List, Optional

from digital_twin.supply_chain_graph import NODE_COLORS, get_node_positions


def render_forecast_dashboard(
    demand_df: pd.DataFrame,
    forecast_df: pd.DataFrame,
    accuracy_metrics: Dict,
    selected_product: str,
):
    """Render the demand forecast dashboard section."""
    st.subheader(f"Demand Forecast — {selected_product}")

    if forecast_df.empty:
        st.warning("No forecast data available.")
        return

    product_forecast = forecast_df[forecast_df["product_id"] == selected_product]
    if product_forecast.empty:
        st.warning(f"No forecast for product {selected_product}")
        return

    historical = demand_df[demand_df["product_id"] == selected_product].copy()
    historical["date"] = pd.to_datetime(historical["date"])

    # Split forecast into historical fit and future
    future = product_forecast[product_forecast["is_forecast"]].copy()
    historical_fit = product_forecast[~product_forecast["is_forecast"]].copy()

    fig = go.Figure()

    # Historical actual
    fig.add_trace(go.Scatter(
        x=historical["date"],
        y=historical["sales"],
        name="Historical Sales",
        mode="lines",
        line=dict(color="#2196F3", width=2),
    ))

    # In-sample fit
    fig.add_trace(go.Scatter(
        x=historical_fit["date"],
        y=historical_fit["forecast_demand"],
        name="Model Fit",
        mode="lines",
        line=dict(color="#FF9800", width=1.5, dash="dot"),
    ))

    # Future forecast
    if not future.empty:
        fig.add_trace(go.Scatter(
            x=future["date"],
            y=future["forecast_demand"],
            name="Forecast",
            mode="lines",
            line=dict(color="#4CAF50", width=2.5),
        ))

        # Confidence interval
        fig.add_trace(go.Scatter(
            x=pd.concat([future["date"], future["date"].iloc[::-1]]),
            y=pd.concat([future["upper_bound"], future["lower_bound"].iloc[::-1]]),
            name="95% Confidence Interval",
            fill="toself",
            fillcolor="rgba(76, 175, 80, 0.15)",
            line=dict(color="rgba(76, 175, 80, 0)"),
        ))

    fig.update_layout(
        title=f"Demand Forecast for {selected_product}",
        xaxis_title="Date",
        yaxis_title="Units",
        height=400,
        hovermode="x unified",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
    )
    st.plotly_chart(fig, use_container_width=True)

    # Metrics row
    if accuracy_metrics and selected_product in accuracy_metrics:
        metrics = accuracy_metrics[selected_product]
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("MAE", f"{metrics.get('MAE', 'N/A')}" if metrics.get('MAE') else "N/A")
        with col2:
            st.metric("RMSE", f"{metrics.get('RMSE', 'N/A')}" if metrics.get('RMSE') else "N/A")
        with col3:
            mape = metrics.get("MAPE")
            st.metric("MAPE", f"{mape:.1f}%" if mape else "N/A")
        with col4:
            future_total = future["forecast_demand"].sum() if not future.empty else 0
            st.metric("Total Forecast (Period)", f"{int(future_total):,} units")

    # Forecast table
    if not future.empty:
        st.subheader("Forecast Data")
        display_df = future[["date", "forecast_demand", "lower_bound", "upper_bound"]].copy()
        display_df["date"] = display_df["date"].dt.strftime("%Y-%m-%d")
        display_df = display_df.rename(columns={
            "date": "Date",
            "forecast_demand": "Forecast",
            "lower_bound": "Lower Bound",
            "upper_bound": "Upper Bound",
        })
        display_df = display_df.round(1)
        st.dataframe(display_df.head(30), use_container_width=True)


def render_digital_twin_dashboard(G: nx.DiGraph, graph_metrics: Dict):
    """Render the supply chain digital twin dashboard section."""
    st.subheader("Supply Chain Digital Twin")

    if G.number_of_nodes() == 0:
        st.warning("No network data available.")
        return

    # Network metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Nodes", graph_metrics["total_nodes"])
    with col2:
        st.metric("Total Edges", graph_metrics["total_edges"])
    with col3:
        st.metric("Avg Lead Time", f"{graph_metrics['avg_lead_time']:.1f} days")
    with col4:
        st.metric("Total Capacity", f"{graph_metrics['total_capacity']:,}")

    # Node type breakdown
    if graph_metrics.get("nodes_by_type"):
        col_a, col_b = st.columns([1, 2])
        with col_a:
            st.markdown("**Nodes by Type**")
            for ntype, count in graph_metrics["nodes_by_type"].items():
                color = NODE_COLORS.get(ntype, "#607D8B")
                st.markdown(
                    f'<span style="color:{color}; font-weight:600">●</span> {ntype.capitalize()}: **{count}**',
                    unsafe_allow_html=True,
                )

        with col_b:
            # Pie chart
            type_data = graph_metrics["nodes_by_type"]
            fig_pie = px.pie(
                values=list(type_data.values()),
                names=list(type_data.keys()),
                color=list(type_data.keys()),
                color_discrete_map=NODE_COLORS,
                title="Node Type Distribution",
                hole=0.4,
            )
            fig_pie.update_layout(height=280)
            st.plotly_chart(fig_pie, use_container_width=True)

    # Network graph
    st.markdown("**Supply Chain Network Graph**")
    fig_network = _render_network_graph(G)
    st.plotly_chart(fig_network, use_container_width=True)

    # Critical paths
    if graph_metrics.get("critical_paths"):
        st.markdown("**Critical Paths**")
        for cp in graph_metrics["critical_paths"]:
            st.info(f"{cp['path']} | Hops: {cp['hops']} | Total Lead Time: {cp['total_lead_time']} days")


def _render_network_graph(G: nx.DiGraph) -> go.Figure:
    """Render the supply chain network as a Plotly graph."""
    positions = get_node_positions(G)

    edge_x, edge_y = [], []
    for u, v in G.edges():
        x0, y0 = positions.get(u, (0, 0))
        x1, y1 = positions.get(v, (0, 0))
        edge_x.extend([x0, x1, None])
        edge_y.extend([y0, y1, None])

    node_x, node_y, node_colors, node_text, node_hover = [], [], [], [], []
    for node, data in G.nodes(data=True):
        x, y = positions.get(node, (0, 0))
        ntype = data.get("node_type", "warehouse")
        node_x.append(x)
        node_y.append(y)
        node_colors.append(NODE_COLORS.get(ntype, "#607D8B"))
        node_text.append(node)
        
        in_edges = list(G.in_edges(node, data=True))
        out_edges = list(G.out_edges(node, data=True))
        hover_parts = [f"<b>{node}</b>", f"Type: {ntype}"]
        if out_edges:
            avg_cap = np.mean([e[2]["capacity"] for e in out_edges])
            avg_lt = np.mean([e[2]["lead_time"] for e in out_edges])
            hover_parts.append(f"Avg Capacity: {avg_cap:.0f}")
            hover_parts.append(f"Avg Lead Time: {avg_lt:.1f} days")
        node_hover.append("<br>".join(hover_parts))

    fig = go.Figure()

    # Edges
    fig.add_trace(go.Scatter(
        x=edge_x, y=edge_y,
        mode="lines",
        line=dict(width=1.5, color="#AAAAAA"),
        hoverinfo="none",
        name="Routes",
    ))

    # Nodes
    fig.add_trace(go.Scatter(
        x=node_x, y=node_y,
        mode="markers+text",
        marker=dict(size=20, color=node_colors, line=dict(width=2, color="white")),
        text=node_text,
        textposition="top center",
        hovertext=node_hover,
        hoverinfo="text",
        name="Nodes",
    ))

    fig.update_layout(
        title="Supply Chain Network",
        showlegend=False,
        hovermode="closest",
        height=500,
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
    )

    return fig


def render_simulation_dashboard(simulation_results: Dict, scenario_comparison: pd.DataFrame):
    """Render the disruption simulation dashboard section."""
    st.subheader("Disruption Simulation")

    if not simulation_results or "error" in simulation_results:
        st.warning("No simulation results available.")
        return

    metrics = simulation_results.get("metrics", {})

    # Metrics row
    col1, col2, col3 = st.columns(3)
    with col1:
        sl = metrics.get("service_level", {})
        st.metric(
            "Avg Service Level",
            f"{sl.get('mean', 0):.1%}",
            delta=f"±{sl.get('std', 0):.1%} std",
        )
    with col2:
        lt = metrics.get("lead_time_increase_days", {})
        st.metric(
            "Lead Time Increase",
            f"{lt.get('mean', 0):.1f} days",
            delta=f"P90: {lt.get('p90', 0):.1f} days",
            delta_color="inverse",
        )
    with col3:
        so = metrics.get("stockout_probability", {})
        st.metric(
            "Stockout Probability",
            f"{so.get('mean', 0):.1%}",
            delta=f"Worst case: {so.get('worst_case', 0):.1%}",
            delta_color="inverse",
        )

    # Distribution charts
    raw = simulation_results.get("raw_data", {})
    if raw:
        fig = make_subplots(rows=1, cols=3, subplot_titles=[
            "Service Level Distribution",
            "Lead Time Increase Distribution",
            "Stockout Probability Distribution",
        ])

        fig.add_trace(go.Histogram(
            x=raw.get("service_levels", []),
            nbinsx=20,
            name="Service Level",
            marker_color="#4CAF50",
            opacity=0.75,
        ), row=1, col=1)

        fig.add_trace(go.Histogram(
            x=raw.get("lead_time_increases", []),
            nbinsx=20,
            name="Lead Time",
            marker_color="#FF9800",
            opacity=0.75,
        ), row=1, col=2)

        fig.add_trace(go.Histogram(
            x=raw.get("stockout_probs", []),
            nbinsx=20,
            name="Stockout",
            marker_color="#F44336",
            opacity=0.75,
        ), row=1, col=3)

        fig.update_layout(
            height=350,
            showlegend=False,
            title="Monte Carlo Simulation Results Distribution",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig, use_container_width=True)

    # Scenario comparison
    if not scenario_comparison.empty:
        st.subheader("Scenario Comparison")
        fig_bar = go.Figure()

        scenarios = scenario_comparison["description"].tolist()

        fig_bar.add_trace(go.Bar(
            name="Avg Service Level",
            x=scenarios,
            y=scenario_comparison["avg_service_level"].tolist(),
            marker_color="#4CAF50",
            yaxis="y",
        ))
        fig_bar.add_trace(go.Bar(
            name="Stockout Probability",
            x=scenarios,
            y=scenario_comparison["stockout_probability"].tolist(),
            marker_color="#F44336",
            yaxis="y",
        ))

        fig_bar.update_layout(
            barmode="group",
            height=350,
            xaxis_title="Disruption Scenario",
            yaxis_title="Probability",
            yaxis=dict(tickformat=".0%"),
            hovermode="x",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig_bar, use_container_width=True)
        st.dataframe(scenario_comparison.round(4), use_container_width=True)


def render_optimization_dashboard(policy_df: pd.DataFrame, optimization_summary: Dict):
    """Render the inventory optimization dashboard section."""
    st.subheader("Inventory Optimization")

    if policy_df.empty:
        st.warning("No optimization results available.")
        return

    # Summary metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Products Analyzed", optimization_summary.get("total_products", 0))
    with col2:
        st.metric("Warehouses", optimization_summary.get("total_warehouses", 0))
    with col3:
        reorder_count = optimization_summary.get("reorder_now_count", 0)
        st.metric("Needs Reorder", reorder_count, delta=f"{optimization_summary.get('low_stock_count', 0)} low")
    with col4:
        total_cost = optimization_summary.get("total_annual_cost", 0)
        st.metric("Total Annual Cost", f"${total_cost:,.0f}")

    # Status-colored table
    st.subheader("Inventory Policy Table")

    def color_status(val):
        if val == "REORDER NOW":
            return "background-color: #FFEBEE; color: #C62828; font-weight: bold"
        elif val == "LOW":
            return "background-color: #FFF3E0; color: #E65100"
        else:
            return "background-color: #E8F5E9; color: #2E7D32"

    display_cols = [
        "product_id", "warehouse_id", "current_inventory", "eoq",
        "safety_stock", "reorder_point", "total_annual_cost", "status"
    ]
    display_df = policy_df[display_cols].copy()
    styled = display_df.style.map(color_status, subset=["status"])
    st.dataframe(styled, use_container_width=True)

    # EOQ vs Safety Stock scatter
    fig = px.scatter(
        policy_df,
        x="eoq",
        y="safety_stock",
        size="total_annual_cost",
        color="status",
        hover_name="product_id",
        hover_data=["warehouse_id", "reorder_point"],
        title="EOQ vs Safety Stock by Product",
        color_discrete_map={"REORDER NOW": "#F44336", "LOW": "#FF9800", "OK": "#4CAF50"},
        labels={"eoq": "Economic Order Quantity", "safety_stock": "Safety Stock"},
    )
    fig.update_layout(height=400, plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(fig, use_container_width=True)


def render_risk_dashboard(
    network_risk_df: pd.DataFrame,
    demand_risk_df: pd.DataFrame,
    risk_alerts: List[Dict],
    overall_risk: Dict,
):
    """Render the risk monitoring dashboard section."""
    st.subheader("Supply Chain Risk Dashboard")

    # Overall risk index
    risk_level = overall_risk.get("risk_level", "UNKNOWN")
    risk_score = overall_risk.get("overall_risk_index", 0)
    risk_color = {"CRITICAL": "#C62828", "HIGH": "#E65100", "MEDIUM": "#F9A825", "LOW": "#2E7D32"}.get(risk_level, "#607D8B")

    st.markdown(
        f"""
        <div style="background: {risk_color}18; border-left: 4px solid {risk_color}; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px;">
            <h3 style="color: {risk_color}; margin: 0;">Overall Risk Level: {risk_level}</h3>
            <p style="margin: 4px 0 0 0; color: {risk_color};">Risk Index: {risk_score:.2%} | Critical Nodes: {overall_risk.get('critical_nodes', 0)} | High Risk Nodes: {overall_risk.get('high_risk_nodes', 0)}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Overall Risk Index", f"{risk_score:.1%}")
    with col2:
        st.metric("Network Risk", f"{overall_risk.get('network_risk', 0):.1%}")
    with col3:
        st.metric("Demand Risk", f"{overall_risk.get('demand_risk', 0):.1%}")

    # Risk alerts
    st.subheader("Risk Alerts")
    if not risk_alerts:
        st.success("No critical or high risk alerts.")
    else:
        for alert in risk_alerts[:10]:
            sev = alert["severity"]
            color = {"CRITICAL": "error", "HIGH": "warning", "MEDIUM": "info"}.get(sev, "info")
            getattr(st, color)(f"[{sev}] **{alert['type']} — {alert['entity']}**: {alert['message']}")

    # Risk heatmap
    if not network_risk_df.empty:
        st.subheader("Node Risk Heatmap")
        
        heatmap_data = network_risk_df[["node", "node_type", "supply_concentration_risk",
                                         "lead_time_risk", "capacity_risk",
                                         "network_criticality", "composite_risk_score"]].copy()

        fig = px.bar(
            network_risk_df.head(15),
            x="node",
            y="composite_risk_score",
            color="risk_level",
            color_discrete_map={"CRITICAL": "#C62828", "HIGH": "#FF6F00", "MEDIUM": "#F9A825", "LOW": "#43A047"},
            title="Top 15 Nodes by Risk Score",
            labels={"composite_risk_score": "Risk Score", "node": "Node"},
            text="composite_risk_score",
        )
        fig.update_traces(texttemplate="%{text:.2%}", textposition="outside")
        fig.update_layout(
            height=400,
            yaxis_tickformat=".0%",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig, use_container_width=True)

        # Risk dimension heatmap
        st.subheader("Risk Dimension Heatmap")
        hm_df = network_risk_df.head(12).set_index("node")[[
            "supply_concentration_risk", "lead_time_risk", "capacity_risk", "network_criticality"
        ]]
        fig_hm = px.imshow(
            hm_df.values,
            x=["Supply Concentration", "Lead Time", "Capacity", "Network Criticality"],
            y=hm_df.index.tolist(),
            color_continuous_scale="RdYlGn_r",
            title="Risk Dimensions Heatmap (by Node)",
            aspect="auto",
            zmin=0,
            zmax=1,
        )
        fig_hm.update_layout(height=400)
        st.plotly_chart(fig_hm, use_container_width=True)

        # Full risk table
        st.subheader("Full Risk Table")
        st.dataframe(network_risk_df.round(4), use_container_width=True)
