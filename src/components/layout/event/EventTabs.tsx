"use client";
import { useState } from "react";
import { Tab, Tabs } from "@heroui/react";
import EventFormContent from "./EventFormContent";
import EventTicket from "./EventTicket";
import EventSponsor from "./EventSponsor";

const tabComponents = {
  formDetail: EventFormContent,
  formSponsor: EventSponsor,
  formTicket: EventTicket,
};

export default function EventTabs() {
  const [selectedTab, setSelectedTab] = useState("formDetail");
  const [rightButton, setRightButton] = useState(null);

  const SelectedComponent = tabComponents[selectedTab] || EventFormContent;

  // Truyền nút từ component con ra ngoài
  const handleEditButtonRender = (button) => {
    setRightButton(button);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-5 border border-gray-300 shadow-lg rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <Tabs
            className="flex-1"
            aria-label="Event Form Tabs"
            selectedKey={selectedTab}
            color="primary"
            onSelectionChange={(key) => {
              setRightButton(null); // Reset button khi chuyển tab
              setSelectedTab(key as string);
            }}
          >
            <Tab key="formDetail" title="Chi tiết sự kiện" />
            <Tab key="formSponsor" title="Thông tin tài trợ" />
            <Tab key="formTicket" title="Thông tin vé" />
          </Tabs>
          {rightButton && <div className="ml-4">{rightButton}</div>}
        </div>
        <SelectedComponent onEditButtonRender={handleEditButtonRender} />
      </div>
    </div>
  );
}