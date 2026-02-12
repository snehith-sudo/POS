"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CommonButton, SaveButton, CancelButton } from "@/app/commons/Button";
import { LabeledInput } from "@/app/commons/LabelInput";
import { Client, PAGE_SIZE, MAX_NAME_LENGTH } from "../../tools/ClientTools";
import { DataTable } from "@/app/commons/DataTable";

export default function ClientPage() {

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("")

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [isLast, setIsLast] = useState<boolean>(false);
  const prevPageRef = useRef<number | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [filterapplied, setFilterApplied] = useState(false);

  async function fetchClients(currentPage: number) {
    setLoading(true);

    try {
      const res = await fetch("/api/client/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          page: currentPage - 1,
          size: PAGE_SIZE,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data?.message || "Failed to fetch clients");
        return;
      }

      // Extract content array and pagination metadata
      setClients(data.content || []);
      setIsFirst(data.first || false);
      setIsLast(data.last || false);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearFilter() {
    setSearchValue("");
    setFilterApplied(false);
    fetchClients(1);
  }


  useEffect(() => {
    if (prevPageRef.current === currentPage) return;
    prevPageRef.current = currentPage;
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

  async function handleFilter() {
    const toastId = toast.loading("Fetching Inventory data...");

    setFilterApplied(true);

    if (!searchValue.trim()) toast.error("Required a value for filtering", { id: toastId });

    const res = await fetch("/api/client/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchValue, })
    })
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to fetch Client", { id: toastId });
      setLoading(false)
      setIsSaving(false)
      return;
    }

    toast.success(result.message || "Result got successfully",
      { id: toastId });

    const normalizedClients = Array.isArray(result) ? result : [result];

    setClients(normalizedClients);
  }


  return (
    <div className="p-6">
      <div className="flex justify-between items-center ">
        <h1 className="text-3xl font-bold">Clients</h1>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center mt-2">
          <LabeledInput
            label="Search by ClientName"
            placeholder="Search by ClientName"
            value={searchValue}
            onChange={(v) => setSearchValue(v)}
            className="w-56 mb-6"
          />
          <CommonButton onClick={handleFilter} disabled={loading || !searchValue.trim()}>
            Search
          </CommonButton>
         {filterapplied && <CommonButton onClick={handleClearFilter} >
            Clear Filter
          </CommonButton>}
        </div>
        {role !== "OPERATOR" && (
          <CommonButton onClick={() => setShowModal(true)}>
            Add Client
          </CommonButton>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <CommonButton disabled={isFirst || loading} onClick={() => setCurrentPage(p => p - 1)}>
          Prev
        </CommonButton>

        <span className="py-1">
          Page {currentPage}
        </span>

        <CommonButton disabled={isLast || loading || searchValue.trim().length !== 0} onClick={() => setCurrentPage(p => p + 1)}>
          Next
        </CommonButton>
      </div>

      {/* Table */}

      <DataTable
        data={clients}
        rowKey={(row, index) => `${row.id}-${index}`}
        columns={[
          {
            header: "S.No",
            render: (_row, index) => (currentPage - 1) * PAGE_SIZE + (index ?? 0) + 1,
          },
          {
            header: "Client",
            render: (row) => row.name,
          },
        ]}
      />

      {filterapplied && clients.length === 0 && (
        <div className="mt-4 text-center text-gray-500">No clients found</div>
      )}

      {/* Pagination */}


      {/* Modal */}
      {showModal && role !== "OPERATOR" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md  flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Client</h2>

            <LabeledInput
              label="Client name"
              placeholder="Client name"
              value={clientName}
              onChange={(v) => setClientName(v)}
              className="w-full mb-4"
            />

            <p className={`text-sm ${clientName.trim().length > MAX_NAME_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
              {clientName.length}/{MAX_NAME_LENGTH}
            </p>

            <div className="flex justify-start gap-3">
              <SaveButton
                onClick={handleAddClient}
                disabled={isSaving || clientName.trim() === "" || clientName.trim().length > MAX_NAME_LENGTH}
              >
                Save
              </SaveButton>
              <CancelButton
                onClick={() => setShowModal(false)}
                disabled={isSaving}
              >
                Cancel
              </CancelButton>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// service layer 