const { useState, useEffect } = React;

const PRICE_PER_DAY = 50; // Rs. 50 per presence

const App = () => {
  const [presentDates, setPresentDates] = useState(() => {
    const saved = localStorage.getItem("milkVendorAttendance");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    localStorage.setItem(
      "milkVendorAttendance",
      JSON.stringify([...presentDates])
    );
  }, [presentDates]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  const togglePresence = (dateStr) => {
    const newPresentDates = new Set(presentDates);
    if (presentDates.has(dateStr)) {
      newPresentDates.delete(dateStr);
    } else {
      newPresentDates.add(dateStr);
    }
    setPresentDates(newPresentDates);
  };

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const getMonthlyStats = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    let presentCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      if (presentDates.has(dateStr)) {
        presentCount++;
      }
    }

    return {
      present: presentCount,
      totalBill: presentCount * PRICE_PER_DAY,
      percentage: ((presentCount / daysInMonth) * 100).toFixed(1),
    };
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date().toISOString().split("T")[0];
    const days = [];

    // Empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(React.createElement("td", { key: `empty-${i}` }));
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day);
      const isPresent = presentDates.has(dateStr);
      const isToday = today === dateStr;

      days.push(
        React.createElement(
          "td",
          { key: dateStr },
          React.createElement(
            "button",
            {
              onClick: () => togglePresence(dateStr),
              className: `date-button ${isPresent ? "present" : ""} ${
                isToday ? "today" : ""
              }`,
            },
            day
          )
        )
      );
    }

    // Split days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(React.createElement("tr", { key: i }, days.slice(i, i + 7)));
    }

    return weeks;
  };

  const stats = getMonthlyStats();

  return React.createElement(
    "div",
    { className: "calendar-container" },
    React.createElement(
      "div",
      { className: "calendar-header" },
      React.createElement(
        "button",
        {
          className: "calendar-nav",
          onClick: () => changeMonth(-1),
        },
        "←"
      ),
      React.createElement(
        "div",
        { className: "calendar-title" },
        currentMonth.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })
      ),
      React.createElement(
        "button",
        {
          className: "calendar-nav",
          onClick: () => changeMonth(1),
        },
        "→"
      )
    ),
    React.createElement(
      "table",
      { className: "calendar-table" },
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) =>
            React.createElement("th", { key: day }, day)
          )
        )
      ),
      React.createElement("tbody", null, renderCalendar())
    ),
    React.createElement(
      "div",
      { className: "stats" },
      React.createElement("span", null, `Present: ${stats.present} days`),
      React.createElement("span", null, `Bill: ₹${stats.totalBill}`),
      React.createElement("span", null, `${stats.percentage}% attended`)
    )
  );
};

ReactDOM.render(React.createElement(App), document.getElementById("root"));
