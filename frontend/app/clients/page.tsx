"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Client = {
  id: number;
  name: string;
};

const PAGE_SIZE = 10;
const MAX_NAME_LENGTH = 50;

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  async function fetchClients(currentPage: number) {
    setLoading(true);

    try {
      const res = await fetch("/api/client/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          credentials: "include", 
        body: JSON.stringify({
          page: currentPage-1,
          size: PAGE_SIZE,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data?.message || "Failed to fetch clients");
        return;
      }

      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClients(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setRole(sessionStorage.getItem("role"));
  }, []);

  async function handleAddClient() {
    const currentRole = sessionStorage.getItem("role");
    if (currentRole === "OPERATOR") {
      toast.error("Not authorized to add clients");
      return;
    }
    if (!clientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    if (clientName.trim().length > MAX_NAME_LENGTH) {
      toast.error(`Client name must not exceed ${MAX_NAME_LENGTH} characters`);
      return;
    }

    const toastId = toast.loading("Saving client...");
    setIsSaving(true);

    try {
      const res = await fetch("/api/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clientName }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to add client", {
          id: toastId,
        });
        return;
      }

      toast.success("Client added", { id: toastId });

      setClientName("");
      setShowModal(false);

      // reload current page
      fetchClients(currentPage);
    } catch (error) {
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  }


  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        {role !== "OPERATOR" && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white
                 px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
          >
            + Add Client
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-3 text-left">S.No</th>
              <th className="px-6 py-3 text-left">Client Name</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="px-6 py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-6 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            ) : (
              clients.map((client, index) => (
                <tr key={client.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-6 py-4">{client.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          disabled={currentPage === 1 || loading}
          onClick={() => setCurrentPage(p => p - 1)}
          className="px-4 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-1 text-sm">
          Page {currentPage}
        </span>

        <button
          disabled={!hasNextPage || loading}
          onClick={() => setCurrentPage(p => p + 1)}
          className="px-4 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {showModal && role !== "OPERATOR" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Client</h2>

            <input
              type="text"
              placeholder="Client name"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full border px-4 py-2 rounded mb-4"
              disabled={isSaving}
            />

            <p className={`text-sm ${clientName.trim().length > MAX_NAME_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
              {clientName.length}/{MAX_NAME_LENGTH}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white
               px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                disabled={isSaving || clientName.trim() === "" || clientName.trim().length > MAX_NAME_LENGTH}
                className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white
               px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// service layer 