import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  Plus,
  LayoutDashboard,
  Receipt,
  Leaf,
  X,
  Pencil,
  Trash2,
  Search,
  ChevronRight,
  Wallet,
  Coffee,
  Bus,
  ShoppingBag,
  Clapperboard,
  Shapes,
  ArrowDownLeft,
} from "lucide-react";
import "./styles.css";
const KEY = "spendwise.expenses.v1";
const categories = ["Food", "Transport", "Shopping", "Entertainment", "Other"];
const colors = ["#d7a765", "#799b91", "#8d8bc1", "#d18378", "#b6bcb1"];
const icons = [Coffee, Bus, ShoppingBag, Clapperboard, Shapes];
const money = (n) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    n / 100,
  );
const today = () => new Date().toLocaleDateString("en-CA");
function read() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data)
      ? data.filter(
          (e) =>
            e &&
            typeof e.id === "string" &&
            typeof e.name === "string" &&
            Number.isSafeInteger(e.amount) &&
            e.amount > 0 &&
            categories.includes(e.category) &&
            /^\d{4}-\d{2}-\d{2}$/.test(e.date),
        )
      : [];
  } catch {
    return [];
  }
}
function App() {
  const [expenses, setExpenses] = useState(read),
    [view, setView] = useState("Overview"),
    [category, setCategory] = useState("All categories"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [search, setSearch] = useState(""),
    [modal, setModal] = useState(null),
    [error, setError] = useState(""),
    [formError, setFormError] = useState("");
  useEffect(() => {
    if (!modal) return;
    const dialog = document.querySelector("[role=dialog]");
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setModal(null);
        return;
      }
      if (e.key !== "Tab") return;
      const controls = [...dialog.querySelectorAll("button,input,select")];
      const first = controls[0],
        last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [modal]);
  const now = new Date(),
    month = today().slice(0, 7),
    monthly = expenses.filter((e) => e.date.startsWith(month)),
    total = monthly.reduce((s, e) => s + e.amount, 0),
    totals = categories.map((c) =>
      monthly.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
    ),
    largest = Math.max(...totals),
    top = total ? categories[totals.indexOf(largest)] : "—";
  const filtered = expenses
    .filter(
      (e) =>
        (category === "All categories" || e.category === category) &&
        (!from || e.date >= from) &&
        (!to || e.date <= to) &&
        e.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  function persist(next) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setExpenses(next);
      setError("");
      return true;
    } catch {
      setError(
        "Your browser could not save this change. Free up storage or enable local storage and try again.",
      );
      return false;
    }
  }
  function open(e) {
    setFormError("");
    setModal(e || { name: "", amount: "", date: today(), category: "Food" });
  }
  function save(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget),
      amount = Math.round(Number(data.get("amount")) * 100),
      name = data.get("name").trim(),
      date = data.get("date");
    if (!name || !Number.isSafeInteger(amount) || amount <= 0 || !date) {
      setFormError(
        "Enter a description, a valid date, and an amount greater than £0.00.",
      );
      return;
    }
    const expense = {
      id: modal.id || crypto.randomUUID(),
      name,
      amount,
      date,
      category: data.get("category"),
    };
    if (
      persist(
        modal.id
          ? expenses.map((e) => (e.id === modal.id ? expense : e))
          : [...expenses, expense],
      )
    )
      setModal(null);
    else
      setFormError(
        "This change could not be saved. Check your browser storage settings and try again.",
      );
  }
  let cursor = 0;
  const gradient = totals
    .map((v, i) => {
      const start = cursor;
      cursor += total ? (v / total) * 100 : 0;
      return `${colors[i]} ${start}% ${cursor}%`;
    })
    .join(",");
  return (
    <div className="app">
      <aside>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("Overview");
          }}
        >
          <span className="brand-icon">
            <Leaf size={23} />
          </span>
          spendwise<span className="brand-dot">.</span>
        </a>
        <div className="workspace">PERSONAL WORKSPACE</div>
        <nav>
          {[
            ["Overview", LayoutDashboard],
            ["Transactions", Receipt],
          ].map(([label, Icon]) => (
            <button
              key={label}
              className={view === label ? "active" : ""}
              onClick={() => setView(label)}
            >
              <Icon size={19} />
              {label}
              {view === label && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-icon">✦</span>
          <h3>
            Small steps.
            <br />
            Better habits.
          </h3>
          <p>
            A little awareness today.
            <br />A little more freedom tomorrow.
          </p>
          <div className="note-line" />
        </div>
        <div className="profile">
          <div className="avatar">Y</div>
          <div>
            <strong>Your space</strong>
            <small>Personal account</small>
          </div>
          <span className="local-dot" title="Stored locally" />
        </div>
      </aside>
      <main>
        <header>
          <div className="breadcrumb">
            My workspace <ChevronRight size={14} /> <span>{view}</span>
          </div>
          <span className="private">
            <span /> Private & stored on your device
          </span>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR MONEY, A LITTLE CLEARER</div>
              <h1>
                {view === "Overview"
                  ? "Spending overview"
                  : "Your transactions"}
                <span>.</span>
              </h1>
              <p>
                {view === "Overview"
                  ? "Know where it goes. Make room for what matters."
                  : "Every little expense, all in one place."}
              </p>
            </div>
            <button className="primary" onClick={() => open()}>
              <Plus size={18} /> Add expense
            </button>
          </div>
          {error && (
            <div role="alert" className="error">
              {error}
            </div>
          )}
          {view === "Overview" && (
            <>
              <div className="section-label">
                THIS MONTH{" "}
                <span>
                  {now.toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="stats">
                <section className="total-card">
                  <div className="stat-title">
                    Total spending <Wallet size={19} />
                  </div>
                  <div className="big-number" data-testid="monthly-total">
                    {money(total)}
                  </div>
                  <div className="stat-bottom">
                    <span className="light-icon">
                      <ArrowUpRight size={15} />
                    </span>{" "}
                    A clearer picture of your month
                  </div>
                  <div className="card-orbit" />
                </section>
                <section className="stat-card">
                  <div className="stat-title">
                    Daily average <ArrowUpRight size={18} />
                  </div>
                  <div className="big-number">
                    {money(Math.round(total / now.getDate()))}
                  </div>
                  <div className="muted">
                    Across {now.getDate()} days this month
                  </div>
                </section>
                <section className="stat-card">
                  <div className="stat-title">
                    Top category <ShoppingBag size={18} />
                  </div>
                  <div className="big-number category-number">{top}</div>
                  <div className="muted">
                    {total
                      ? `${Math.round((largest / total) * 100)}% of this month’s spending`
                      : "Your habits will take shape here"}
                  </div>
                </section>
              </div>
              <div className="charts">
                <section className="panel breakdown">
                  <div className="panel-heading">
                    <div>
                      <h2>Where it all goes</h2>
                      <p>A breakdown of your month</p>
                    </div>
                    <span className="pill">By category</span>
                  </div>
                  <div className="breakdown-body">
                    <div
                      className="donut"
                      style={{
                        background: total
                          ? `conic-gradient(${gradient})`
                          : "#edf0ec",
                      }}
                      role="img"
                      aria-label={
                        total
                          ? categories
                              .map((c, i) => `${c}: ${money(totals[i])}`)
                              .join(", ")
                          : "No spending this month"
                      }
                    >
                      <div>
                        <small>TOTAL SPENT</small>
                        <strong>{money(total)}</strong>
                        <span>this month</span>
                      </div>
                    </div>
                    <div className="legend">
                      {categories.map((c, i) => (
                        <div key={c}>
                          <span
                            className="color-dot"
                            style={{ background: colors[i] }}
                          />
                          <span>{c}</span>
                          <strong>{money(totals[i])}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
                <section className="insight">
                  <span className="insight-icon">
                    <Leaf size={23} />
                  </span>
                  <div className="eyebrow">A MOMENT OF CLARITY</div>
                  <h2>
                    Good habits start
                    <br />
                    with the little things.
                  </h2>
                  <p>
                    {expenses.length
                      ? "You’re building a clearer picture with every expense. Keep going — your future self will thank you."
                      : "Your first expense is the first step. Start tracking today and get to know your spending a little better."}
                  </p>
                  <button onClick={() => open()}>
                    Track a little, learn a lot <ArrowUpRight size={17} />
                  </button>
                  <div className="insight-decoration">✳</div>
                </section>
              </div>
            </>
          )}
          <section className="panel transactions">
            <div className="panel-heading">
              <div>
                <h2>
                  {view === "Overview"
                    ? "Recent transactions"
                    : "All transactions"}{" "}
                  <span className="count">{expenses.length}</span>
                </h2>
                <p>The little things that add up</p>
              </div>
              {view === "Overview" && (
                <button
                  className="text-button"
                  onClick={() => setView("Transactions")}
                >
                  View all transactions <ArrowUpRight size={16} />
                </button>
              )}
            </div>
            <div className="filters">
              <div className="search">
                <Search size={17} />
                <input
                  aria-label="Search transactions"
                  placeholder="Search transactions…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <label className="date-filter">
                From
                <input
                  aria-label="From date"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label className="date-filter">
                To
                <input
                  aria-label="To date"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              {(from || to || search || category !== "All categories") && (
                <button
                  className="text-button"
                  onClick={() => {
                    setCategory("All categories");
                    setFrom("");
                    setTo("");
                    setSearch("");
                  }}
                >
                  Reset
                </button>
              )}
            </div>
            {from && to && from > to && (
              <p role="alert" className="error">
                The from date must be on or before the to date.
              </p>
            )}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>TRANSACTION</th>
                    <th>CATEGORY</th>
                    <th>DATE</th>
                    <th className="amount">AMOUNT</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const i = categories.indexOf(e.category),
                      Icon = icons[i];
                    return (
                      <tr key={e.id}>
                        <td>
                          <div className="transaction-name">
                            <span
                              className="transaction-icon"
                              style={{
                                background: colors[i] + "25",
                                color: colors[i],
                              }}
                            >
                              <Icon size={19} />
                            </span>
                            <strong>{e.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="category-tag">
                            <span style={{ background: colors[i] }} />
                            {e.category}
                          </span>
                        </td>
                        <td className="muted">
                          {new Date(e.date + "T12:00:00").toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </td>
                        <td className="amount">{money(e.amount)}</td>
                        <td>
                          <div className="actions">
                            <button
                              aria-label={`Edit ${e.name}`}
                              onClick={() =>
                                open({
                                  ...e,
                                  amount: (e.amount / 100).toFixed(2),
                                })
                              }
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              aria-label={`Delete ${e.name}`}
                              onClick={() => {
                                setFormError("");
                                setModal({ delete: e });
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!filtered.length && (
              <div className="empty">
                <span>
                  <ArrowDownLeft size={25} />
                </span>
                <h3>
                  {expenses.length
                    ? "No matching transactions"
                    : "A fresh start for your finances"}
                </h3>
                <p>
                  {expenses.length
                    ? "Try another category, date range or search."
                    : "Add your first expense. We’ll take care of the bigger picture."}
                </p>
                {!expenses.length && (
                  <button className="text-button" onClick={() => open()}>
                    Add your first expense <Plus size={16} />
                  </button>
                )}
              </div>
            )}
            <div className="table-footer">
              <span>
                {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
              </span>
              <span>
                Total{" "}
                <strong>
                  {money(filtered.reduce((s, e) => s + e.amount, 0))}
                </strong>
              </span>
            </div>
          </section>
          <footer>
            <span className="footer-brand">
              <Leaf size={14} /> A little clarity goes a long way.
            </span>
            <span>Made for your everyday. · GBP £</span>
          </footer>
        </div>
      </main>
      {modal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setModal(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="close"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X size={21} />
            </button>
            <span className="modal-icon">
              <Wallet size={25} />
            </span>
            <h2 id="modal-title">
              {modal.delete
                ? "Delete expense?"
                : modal.id
                  ? "Edit expense"
                  : "A little expense, logged."}
            </h2>
            <p>
              {modal.delete
                ? `Remove “${modal.delete.name}” from your transactions? This cannot be undone.`
                : "Keep your bigger picture up to date."}
            </p>
            {modal.delete ? (
              <div className="modal-buttons">
                <button
                  className="secondary"
                  autoFocus
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    if (
                      persist(expenses.filter((e) => e.id !== modal.delete.id))
                    )
                      setModal(null);
                  }}
                >
                  Delete expense
                </button>
              </div>
            ) : (
              <form onSubmit={save}>
                <label>
                  Description
                  <input
                    name="name"
                    placeholder="e.g. Coffee with a friend"
                    defaultValue={modal.name}
                    maxLength={100}
                    required
                    autoFocus
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Amount (£)
                    <input
                      name="amount"
                      type="number"
                      min="0.01"
                      max="999999999"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={modal.amount}
                      required
                    />
                  </label>
                  <label>
                    Date
                    <input
                      name="date"
                      type="date"
                      defaultValue={modal.date}
                      required
                    />
                  </label>
                </div>
                <label>
                  Category
                  <select
                    aria-label="Category"
                    name="category"
                    defaultValue={modal.category}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                {formError && (
                  <p role="alert" className="error">
                    {formError}
                  </p>
                )}
                <div className="modal-buttons">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button className="primary" type="submit">
                    {modal.id ? "Save changes" : "Add expense"}{" "}
                    <Plus size={17} />
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
