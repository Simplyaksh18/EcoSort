import React, { useEffect, useState } from "react";

export default function Queries() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("Complaint");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notify, setNotify] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("bmc-queries") || "[]");
    setItems(saved);
  }, []);

  const save = (list) => {
    localStorage.setItem("bmc-queries", JSON.stringify(list));
    setItems(list);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    const item = {
      id: "Q-" + Date.now().toString(36).slice(2),
      type,
      subject: subject.trim(),
      message: message.trim(),
      status: "Open",
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...items];
    save(next);
    setSubject("");
    setMessage("");
    setType("Complaint");
    setNotify("Submitted. Thank you!");
    setTimeout(() => setNotify(""), 2500);
  };

  const mark = (id, status) => {
    const next = items.map((i) => (i.id === id ? { ...i, status } : i));
    save(next);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
        <h3 className="text-lg font-semibold">Queries & Feedback (Municipality)</h3>
        <p className="text-xs text-gray-500">Log complaints or suggestions to improve operations.</p>

        <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>Complaint</option>
            <option>Suggestion</option>
          </select>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 md:col-span-2"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue or idea…"
            rows={3}
            className="px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 md:col-span-3"
          />
          <div className="md:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
            >
              Submit
            </button>
            {notify && <span className="text-sm text-green-700">{notify}</span>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Previous Entries</h3>
          <span className="text-xs text-gray-500">{items.length} total</span>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium text-gray-900">{i.id}</td>
                  <td className="py-3 pr-4">{i.type}</td>
                  <td className="py-3 pr-4">{i.subject}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        "px-2.5 py-1 text-xs rounded-full border " +
                        (i.status === "Open"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800")
                      }
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {new Date(i.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    {i.status === "Open" ? (
                      <button
                        onClick={() => mark(i.id, "Closed")}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        onClick={() => mark(i.id, "Open")}
                        className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                      >
                        Reopen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={6}>
                    Nothing submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
