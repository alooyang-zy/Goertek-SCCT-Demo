"""
歌尔供应链控制塔 — 智能分析模块
基于 Nikiyolo AI Supply Chain Control Tower 完整汉化版
保留全部功能逻辑，仅文本改为中文，样式匹配歌尔控制塔主题
"""
import streamlit as st
import pandas as pd
import numpy as np
import warnings

warnings.filterwarnings("ignore")

# ── 页面配置 ─────────────────────────────────────────────────────
st.set_page_config(
    page_title="歌尔供应链控制塔 — 智能分析",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── CSS 主题（匹配歌尔控制塔深色风格）──────────────────────────────
st.markdown("""
<style>
    .main-header {
        font-size: 2rem;
        font-weight: 700;
        color: #3b82f6;
        padding-bottom: 0.25rem;
        border-bottom: 2px solid #3b82f6;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1rem;
        color: #94a3b8;
        margin-bottom: 1.5rem;
    }
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    }
    [data-testid="stSidebar"] * {
        color: #e2e8f0 !important;
    }
    .stMetric {
        background: rgba(59, 130, 246, 0.08);
        border-radius: 10px;
        padding: 1rem;
        border: 1px solid rgba(59, 130, 246, 0.2);
    }
    [data-testid="stMetricLabel"] { color: #94a3b8 !important; font-size: 0.85rem; }
    [data-testid="stMetricValue"] { color: #3b82f6 !important; }
    .stButton > button {
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
    }
    .stButton > button:hover {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
    }
</style>
""", unsafe_allow_html=True)

# ── Session State 初始化 ────────────────────────────────────────────
for key in ["demand_df", "inventory_df", "network_df", "forecast_df",
            "accuracy_metrics", "graph", "graph_metrics",
            "simulation_result", "scenario_comparison",
            "policy_df", "optimization_summary",
            "network_risk_df", "demand_risk_df", "risk_alerts", "overall_risk"]:
    if key not in st.session_state:
        st.session_state[key] = None


# ── 自动加载 Demo 数据 ──────────────────────────────────────────────
def auto_load_demo_data():
    """启动时自动加载Demo数据，让用户立即看到效果"""
    if st.session_state.demand_df is None:
        from data.synthetic_generator import generate_demand_data, generate_inventory_data, generate_network_data
        st.session_state.demand_df = generate_demand_data(n_products=5, n_days=365)
        st.session_state.inventory_df = generate_inventory_data(n_products=5, n_warehouses=3)
        st.session_state.network_df = generate_network_data()


auto_load_demo_data()


# ── 全流水线运行 ────────────────────────────────────────────────────
def run_full_pipeline():
    """运行所有分析模块并缓存结果"""
    from data.data_preprocessor import preprocess_demand_data, preprocess_inventory_data, preprocess_network_data
    from forecasting.forecast_pipeline import run_forecast_pipeline
    from digital_twin.supply_chain_graph import build_supply_chain_graph, get_graph_metrics
    from simulation.disruption_simulator import simulate_disruption, run_scenario_comparison
    from optimization.inventory_optimizer import compute_inventory_policy, get_optimization_summary
    from risk.risk_engine import compute_demand_risk, compute_network_risk, generate_risk_alerts, compute_overall_risk_index

    demand_df = st.session_state.demand_df
    inventory_df = st.session_state.inventory_df
    network_df = st.session_state.network_df

    with st.spinner("正在运行需求预测..."):
        st.session_state.forecast_df, st.session_state.accuracy_metrics = run_forecast_pipeline(
            demand_df=demand_df, forecast_horizon=90
        )

    with st.spinner("正在构建数字孪生..."):
        processed_network = preprocess_network_data(network_df)
        G = build_supply_chain_graph(processed_network)
        st.session_state.graph = G
        st.session_state.graph_metrics = get_graph_metrics(G)

    with st.spinner("正在运行中断模拟..."):
        st.session_state.simulation_result = simulate_disruption(
            G, disruption_type="supplier_shutdown", iterations=100
        )
        st.session_state.scenario_comparison = run_scenario_comparison(G, iterations=100)

    if inventory_df is not None:
        with st.spinner("正在优化库存..."):
            processed_inv = preprocess_inventory_data(inventory_df)
            processed_demand = preprocess_demand_data(demand_df)
            st.session_state.policy_df = compute_inventory_policy(processed_inv, processed_demand)
            st.session_state.optimization_summary = get_optimization_summary(st.session_state.policy_df)

    with st.spinner("正在计算风险评分..."):
        processed_demand = preprocess_demand_data(demand_df)
        st.session_state.demand_risk_df = compute_demand_risk(processed_demand)
        st.session_state.network_risk_df = compute_network_risk(G)
        st.session_state.risk_alerts = generate_risk_alerts(
            st.session_state.network_risk_df, st.session_state.demand_risk_df
        )
        st.session_state.overall_risk = compute_overall_risk_index(
            st.session_state.network_risk_df, st.session_state.demand_risk_df
        )

    st.success("✅ 全流水线分析完成！请切换到各页面查看结果。")


# ── 侧边栏导航 ──────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🧠 歌尔供应链\n智能分析引擎")
    st.markdown("---")

    nav = st.radio(
        "导航",
        options=[
            "📥 数据管理",
            "📈 需求预测",
            "🌐 数字孪生",
            "⚡ 中断模拟",
            "📦 库存优化",
            "🔴 风险监控",
        ],
        label_visibility="collapsed",
    )

    st.markdown("---")
    st.markdown("**数据状态**")
    if st.session_state.demand_df is not None:
        st.success("✅ 需求数据已加载")
    if st.session_state.inventory_df is not None:
        st.success("✅ 库存数据已加载")
    if st.session_state.network_df is not None:
        st.success("✅ 网络数据已加载")

    st.markdown("---")
    st.caption("AI驱动的供应链分析引擎：需求预测、数字孪生、中断模拟、库存优化、风险监控。")


# ── 页面路由 ────────────────────────────────────────────────────────

if nav == "📥 数据管理":
    st.markdown('<div class="main-header">📥 数据管理</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">管理供应链分析数据集，支持Demo数据生成与CSV上传</div>', unsafe_allow_html=True)

    from data.data_loader import upload_demand_data, upload_inventory_data, upload_network_data

    with st.expander("1. 需求数据集", expanded=True):
        demand_df, demand_valid = upload_demand_data()
        if demand_valid and demand_df is not None:
            st.session_state.demand_df = demand_df

    with st.expander("2. 库存数据集", expanded=True):
        inventory_df, inv_valid = upload_inventory_data()
        if inv_valid and inventory_df is not None:
            st.session_state.inventory_df = inventory_df

    with st.expander("3. 供应链网络数据集", expanded=True):
        network_df, net_valid = upload_network_data()
        if net_valid and network_df is not None:
            st.session_state.network_df = network_df

    st.markdown("---")
    st.info("💡 Demo数据已自动加载，可直接点击下方按钮运行全流水线分析。")
    if st.session_state.demand_df is not None and st.session_state.network_df is not None:
        if st.button("🚀 运行全流水线分析", type="primary", use_container_width=True):
            run_full_pipeline()


elif nav == "📈 需求预测":
    st.markdown('<div class="main-header">📈 需求预测</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">基于傅里叶分解模型的需求预测，含95%置信区间</div>', unsafe_allow_html=True)

    from data.data_preprocessor import preprocess_demand_data
    from forecasting.forecast_pipeline import run_forecast_pipeline, get_forecast_summary
    from dashboard.visualization import render_forecast_dashboard

    if st.session_state.demand_df is None:
        st.warning("请先加载需求数据（数据管理页面）。")
    else:
        demand_df = st.session_state.demand_df
        processed_demand = preprocess_demand_data(demand_df)
        products = sorted(processed_demand["product_id"].unique().tolist())

        col1, col2 = st.columns([2, 1])
        with col1:
            selected_product = st.selectbox("选择产品", products)
        with col2:
            forecast_horizon = st.selectbox("预测周期（天）", [90, 180, 360], index=0)

        if st.button("运行预测", type="primary"):
            forecast_df, accuracy_metrics = run_forecast_pipeline(
                demand_df=demand_df,
                forecast_horizon=forecast_horizon,
                products=[selected_product],
            )
            st.session_state.forecast_df = forecast_df
            st.session_state.accuracy_metrics = accuracy_metrics

        if st.session_state.forecast_df is not None and not st.session_state.forecast_df.empty:
            render_forecast_dashboard(
                demand_df=processed_demand,
                forecast_df=st.session_state.forecast_df,
                accuracy_metrics=st.session_state.accuracy_metrics or {},
                selected_product=selected_product,
            )
            summary = get_forecast_summary(st.session_state.forecast_df)
            if not summary.empty:
                st.subheader("按产品汇总")
                st.dataframe(summary, use_container_width=True)
        else:
            st.info("点击「运行预测」生成需求预测。")


elif nav == "🌐 数字孪生":
    st.markdown('<div class="main-header">🌐 供应链数字孪生</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">供应链网络的交互式图模型可视化</div>', unsafe_allow_html=True)

    from data.data_preprocessor import preprocess_network_data
    from digital_twin.supply_chain_graph import build_supply_chain_graph, get_graph_metrics
    from dashboard.visualization import render_digital_twin_dashboard

    if st.session_state.network_df is None:
        st.warning("请先加载网络数据（数据管理页面）。")
    else:
        if st.session_state.graph is None:
            processed_network = preprocess_network_data(st.session_state.network_df)
            G = build_supply_chain_graph(processed_network)
            st.session_state.graph = G
            st.session_state.graph_metrics = get_graph_metrics(G)

        render_digital_twin_dashboard(st.session_state.graph, st.session_state.graph_metrics)


elif nav == "⚡ 中断模拟":
    st.markdown('<div class="main-header">⚡ 中断模拟</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">蒙特卡洛仿真，4种中断场景的概率分析</div>', unsafe_allow_html=True)

    from data.data_preprocessor import preprocess_network_data
    from digital_twin.supply_chain_graph import build_supply_chain_graph
    from simulation.disruption_simulator import simulate_disruption, run_scenario_comparison, DISRUPTION_TYPES
    from dashboard.visualization import render_simulation_dashboard

    if st.session_state.network_df is None:
        st.warning("请先加载网络数据（数据管理页面）。")
    else:
        if st.session_state.graph is None:
            processed_network = preprocess_network_data(st.session_state.network_df)
            G = build_supply_chain_graph(processed_network)
            st.session_state.graph = G

        G = st.session_state.graph

        col1, col2 = st.columns(2)
        with col1:
            disruption_type = st.selectbox(
                "中断类型",
                options=list(DISRUPTION_TYPES.keys()),
                format_func=lambda x: DISRUPTION_TYPES[x]["description"],
            )
        with col2:
            iterations = st.slider("蒙特卡洛迭代次数", 50, 500, 100, step=50)

        all_nodes = sorted(list(G.nodes()))
        affected_node = st.selectbox("受影响节点（可选）", ["(随机)"] + all_nodes)
        affected_node = None if affected_node == "(随机)" else affected_node

        if st.button("运行模拟", type="primary"):
            with st.spinner(f"正在运行 {iterations} 次蒙特卡洛迭代..."):
                result = simulate_disruption(
                    G, disruption_type=disruption_type,
                    affected_node=affected_node, iterations=iterations
                )
                st.session_state.simulation_result = result

            with st.spinner("正在运行场景对比..."):
                scenario_comp = run_scenario_comparison(G, iterations=50)
                st.session_state.scenario_comparison = scenario_comp

        if st.session_state.simulation_result is not None:
            render_simulation_dashboard(
                st.session_state.simulation_result,
                st.session_state.scenario_comparison if st.session_state.scenario_comparison is not None else pd.DataFrame(),
            )
        else:
            st.info("配置中断场景后点击「运行模拟」。")


elif nav == "📦 库存优化":
    st.markdown('<div class="main-header">📦 库存优化</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">EOQ经济订货量、安全库存、再订货点计算</div>', unsafe_allow_html=True)

    from data.data_preprocessor import preprocess_demand_data, preprocess_inventory_data
    from optimization.inventory_optimizer import compute_inventory_policy, get_optimization_summary
    from dashboard.visualization import render_optimization_dashboard

    if st.session_state.demand_df is None or st.session_state.inventory_df is None:
        st.warning("请先加载需求和库存数据（数据管理页面）。")
    else:
        if st.button("运行库存优化", type="primary"):
            with st.spinner("正在优化库存策略..."):
                processed_inv = preprocess_inventory_data(st.session_state.inventory_df)
                processed_demand = preprocess_demand_data(st.session_state.demand_df)
                policy_df = compute_inventory_policy(processed_inv, processed_demand)
                summary = get_optimization_summary(policy_df)
                st.session_state.policy_df = policy_df
                st.session_state.optimization_summary = summary

        if st.session_state.policy_df is not None and not st.session_state.policy_df.empty:
            render_optimization_dashboard(st.session_state.policy_df, st.session_state.optimization_summary or {})
        else:
            st.info("点击「运行库存优化」计算最优库存策略。")


elif nav == "🔴 风险监控":
    st.markdown('<div class="main-header">🔴 风险监控仪表盘</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">实时供应链风险评分与告警系统</div>', unsafe_allow_html=True)

    from data.data_preprocessor import preprocess_demand_data, preprocess_network_data
    from digital_twin.supply_chain_graph import build_supply_chain_graph
    from risk.risk_engine import compute_demand_risk, compute_network_risk, generate_risk_alerts, compute_overall_risk_index
    from dashboard.visualization import render_risk_dashboard

    if st.session_state.demand_df is None or st.session_state.network_df is None:
        st.warning("请先加载需求和网络数据（数据管理页面）。")
    else:
        if st.button("计算风险评分", type="primary"):
            with st.spinner("正在计算供应链风险评分..."):
                if st.session_state.graph is None:
                    processed_network = preprocess_network_data(st.session_state.network_df)
                    G = build_supply_chain_graph(processed_network)
                    st.session_state.graph = G

                processed_demand = preprocess_demand_data(st.session_state.demand_df)
                demand_risk = compute_demand_risk(processed_demand)
                network_risk = compute_network_risk(st.session_state.graph)
                alerts = generate_risk_alerts(network_risk, demand_risk)
                overall = compute_overall_risk_index(network_risk, demand_risk)

                st.session_state.demand_risk_df = demand_risk
                st.session_state.network_risk_df = network_risk
                st.session_state.risk_alerts = alerts
                st.session_state.overall_risk = overall

        if st.session_state.network_risk_df is not None:
            render_risk_dashboard(
                network_risk_df=st.session_state.network_risk_df,
                demand_risk_df=st.session_state.demand_risk_df if st.session_state.demand_risk_df is not None else pd.DataFrame(),
                risk_alerts=st.session_state.risk_alerts or [],
                overall_risk=st.session_state.overall_risk or {},
            )
        else:
            st.info("点击「计算风险评分」分析供应链风险。")
