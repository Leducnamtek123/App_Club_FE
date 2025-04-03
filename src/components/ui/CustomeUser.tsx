
import React from "react";

export default function CustomeUser({ name, position}:any) {
  return (
    <div>
      <div className="block">
        <p className="text-base font-medium text-gray-900">{name}</p>
        {position && (
          <p className="text-sm text-gray-500">{position}</p>
        )}
      </div>
    </div>
  );
}
