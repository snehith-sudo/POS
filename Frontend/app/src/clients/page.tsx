"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CommonButton, SaveButton, CancelButton } from "@/app/commons/Button";
import { LabeledInput } from "@/app/commons/LabelInput";
import { Client, PAGE_SIZE, MAX_NAME_LENGTH } from "../../tools/ClientTools";
import { DataTable } from "@/app/commons/DataTable";
import { createClient, fetchClients, filterClients } from "@/app/service/client-service";

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

  async function handleClearFilter() {
    setSearchValue("");
    setFilterApplied(false);
    fetchPagedData(1);
  }

  useEffect(() => {
    if (prevPageRef.current === currentPage) return;
    prevPageRef.current = currentPage;
    fetchPagedData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setRole(sessionStorage.getItem("role"));
  }, []);


  async function fetchPagedData(page: number) {
    setLoading(true);

    try {
      const data = await fetchClients(page - 1, PAGE_SIZE);

      setSearchValue("");
      setFilterApplied(false);

      setClients(data.content);
      setIsFirst(data.first);
      setIsLast(data.last);

    } catch (err: any) {
      toast.error(err.message || "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  }
  async function handleAddClient() {

    const toastId = toast.loading("Saving client...");
    setIsSaving(true);

    try {
      console.log("Creating client with name:", clientName);
      await createClient(clientName);

      toast.success("Client added", { id: toastId });

      setClientName("");
      setShowModal(false);
      setIsSaving(false);
      await fetchClients(currentPage, PAGE_SIZE);

    } catch (err: any) {
      setIsSaving(false);
      toast.error(err.message || "Failed to add client", { id: toastId });
    }
  }

  async function handleFilter() {

    const toastId = toast.loading("Fetching clients...");

    try {
      const data = await filterClients(searchValue);

      setClients(Array.isArray(data) ? data : [data]);
      setFilterApplied(true);

      toast.success("Result fetched", { id: toastId });

    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold">Clients</h1>
      </div>

      <div className="mt-3 flex flex-col gap-3">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full">

            <div className="flex-1 min-w-0">
              <LabeledInput
                label="Search by Client Name"
                placeholder="Type client name..."
                value={searchValue}
                onChange={(v) => setSearchValue(v)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 w-full sm:w-auto">

              <CommonButton
                onClick={handleFilter}
                disabled={loading || !searchValue.trim()}
                className="w-full sm:w-auto h-11 whitespace-nowrap"
              >
                Search
              </CommonButton>

              {filterapplied && (
                <CommonButton
                  onClick={handleClearFilter}
                  className="w-full sm:w-auto h-11 whitespace-nowrap"
                >
                  Clear
                </CommonButton>
              )}
            </div>
          </div>

          {role !== "OPERATOR" && (
            <CommonButton
              onClick={() => setShowModal(true)}
              className="w-full lg:w-auto h-11"
            >
              + Add Client
            </CommonButton>
          )}

        </div>
      </div>


      <div className="flex justify-end gap-3">
        <CommonButton disabled={isFirst || loading} onClick={() => setCurrentPage(p => p - 1)}>
          Prev
        </CommonButton>

        <span className="py-1 mt-5">
          Page {currentPage}
        </span>

        <CommonButton disabled={isLast || loading || searchValue.trim().length !== 0} onClick={() => setCurrentPage(p => p + 1)}>
          Next
        </CommonButton>
      </div>

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

      {/* Modal */}
      {showModal && role !== "OPERATOR" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-t-lg sm:rounded-lg p-4 sm:p-6 w-full h-full sm:h-auto overflow-auto sm:max-w-md">
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

            <div className="flex flex-col sm:flex-row justify-start gap-3">
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