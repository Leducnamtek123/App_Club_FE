"use client";

import ModalCreateBranch from "@/components/ui/branch/createFormModal";
import TableCustomize from "@/components/ui/table_customize";
import { deleteBranch, getBranches } from "@/services/branch/branchServices";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";

type Branch = {
  id: string;
  name: string;
  description: string;
};

export const columns = [
  { name: "Tên chi hội", uid: "name" },
  { name: "Thông tin chi tiết", uid: "description" },
  // ( name: "ngày tạo", uid: "createdAt"),
  // ( name: "ngày thay đổi", uid: "updatedAt" ),
  { name: "Actions", uid: "actions" },
] as never;
export const searchBy = ["name"] as never;

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Function to fetch data from API
  const fetchData = async () => {
    try {
      const branches = await getBranches();
      setIsLoading(true);
      if (branches) {
        setBranches(branches);
      } else {
        console.log("Error fetching branches");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteBranch(id);
      if (response) {
        setBranches((prevBranches) =>
          prevBranches.filter((branch) => branch.id !== id)
        );
        console.log("Branch deleted successfully");
      } else {
        console.log("Failed to delete branch");
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
    }
  };

  // Handle get data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const branches = await getBranches();
        if (branches) {
          setBranches(branches);
        } else {
          console.log("Error call API");
          setIsLoading(false);
        }
      } catch (error) {
        throw error;
      }finally{
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // cột tinh chỉnh
  const columnsConfig = {
    branchName: (data: any) => (
      <div className="w-32 truncate">
        <p>{data.name}</p>
      </div>
    ),
    branchDescription: (data: any) => (
      <div className="w-40 truncate">
        <p>{data.description}</p>
      </div>
    ),
    actions: (data: any) => (
      <div className="relative flex justify-center items-center h-9">
        <Popover>
          <PopoverTrigger>
            <Button isIconOnly variant="light" color="danger">
              <BiTrash size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="gap-2 flex text-sm my-1 justify-center items-center">
              <div>Bạn có muốn xóa?</div>
              <Button
                size="sm"
                color="danger"
                onPress={() => {
                  // dùng cho sau này
                  // handleDelete(data.id);
                }}
              >
                Đồng ý
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
  };

  return (
    <section className="flex justify-center z-0">
      {/* Tiêu đề của page */}
      <div className="w-full">
        <div className="mb-10">
          <p className="font-bold text-2xl">Danh sách chi hội</p>
        </div>

        {/* Hiện bảng */}
        <TableCustomize
          ariaLabel="Branch event"
          data={branches}
          columns={columns}
          searchBy={searchBy}
          columnsConfig={columnsConfig}
          isLoading={isLoading}
          formModal={<Button
            endContent={<FaPlus />}
            color="primary"
            onPress={() => setIsModalOpen(true)}
          >
            Thêm chi hội
          </Button>} page={0} totalPages={0} onPageChange={function (page: number): void {
            throw new Error("Function not implemented.");
          } }        />
        <ModalCreateBranch
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setSelectedData={setBranches} // Pass function to update branches
          refreshData={fetchData}
        />
      </div>
    </section>
  );
}
