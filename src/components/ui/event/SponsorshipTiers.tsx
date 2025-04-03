"use client";

import { EventBenefit, SponsorshipTier, SponsorshipTierDTO } from "@/lib/model/type";
import { Chip, Select, SelectItem, Input } from "@heroui/react";
import { useState, useEffect, useMemo } from "react";

const TIERS = [
  { name: "Kim cương", key: "diamond", color: "bg-gradient-to-r from-purple-500 to-blue-500" },
  { name: "Vàng", key: "platinum", color: "bg-gradient-to-r from-yellow-400 to-orange-500" },
  { name: "Bạc", key: "gold", color: "bg-gradient-to-r from-gray-300 to-gray-500" },
  { name: "Đồng", key: "silver", color: "bg-gradient-to-r from-orange-300 to-red-400" },
];

interface SponsorshipTiersProps {
  sponsorshipTiers: SponsorshipTierDTO[] | undefined; // Nhận dữ liệu hiển thị dưới dạng SponsorshipTierDTO
  setSponsorshipTiers: (tiers: SponsorshipTierDTO[]) => void; // Trả về dữ liệu form dưới dạng SponsorshipTier
  benefitData: EventBenefit[];
  errors: Record<string, string>;
}

export default function SponsorshipTiers({
  sponsorshipTiers,
  setSponsorshipTiers,
  benefitData,
  errors,
}: SponsorshipTiersProps) {
  const [benefits, setBenefits] = useState<Record<string, { minAmount: number; benefitIds: string[] }>>(() => {
    const initialBenefits: Record<string, { minAmount: number; benefitIds: string[] }> = {};
    TIERS.forEach(tier => {
      // Nếu sponsorshipTiers không tồn tại hoặc rỗng, khởi tạo với giá trị mặc định
      const existingTier = sponsorshipTiers?.find(t => t.name === tier.name);
      initialBenefits[tier.key] = {
        minAmount: existingTier?.minAmount ? parseFloat(existingTier.minAmount.toString()) : 0,
        benefitIds: existingTier?.benefits?.map(benefit => benefit.id) || [] // Lấy benefitIds từ benefits
      };
    });
    return initialBenefits;
  });

  useEffect(() => {
    // Chuyển đổi dữ liệu từ state benefits sang SponsorshipTier để gửi lên form
    const updatedTiers: SponsorshipTierDTO[] = TIERS.map(tier => ({
      id: sponsorshipTiers?.find(t => t.name === tier.name)?.id || "", // Use existing id or default to an empty string
      name: tier.name,
      minAmount: benefits[tier.key].minAmount.toString(), // Convert minAmount to string
      sponsorBenefitIds: benefits[tier.key].benefitIds,
      createdAt: sponsorshipTiers?.find(t => t.name === tier.name)?.createdAt || new Date().toISOString(), // Use existing or default timestamp
      updatedAt: new Date().toISOString(), // Set updated timestamp
      event: sponsorshipTiers?.find(t => t.name === tier.name)?.event || null, // Use existing event or null
      benefits: benefitData.filter(b => benefits[tier.key].benefitIds.includes(b.id)) // Map benefit objects
    }));
    setSponsorshipTiers(updatedTiers);
  }, [benefits, setSponsorshipTiers]);

  const benefitOptions = useMemo(() => {
    return benefitData.map(benefit => ({
      key: benefit.id,
      label: benefit.title || "Unknown"
    }));
  }, [benefitData]);

  const handleMinAmountChange = (tierKey: string, value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    const numberValue = cleanValue ? parseInt(cleanValue) : 0;
    
    setBenefits(prev => ({
      ...prev,
      [tierKey]: {
        ...prev[tierKey],
        minAmount: numberValue
      }
    }));
  };

  const handlePerksChange = (tierKey: string, keys: Set<string>) => {
    const benefitIds = Array.from(keys);
    
    setBenefits(prev => ({
      ...prev,
      [tierKey]: {
        ...prev[tierKey],
        benefitIds
      }
    }));
  };

  return (
    <div className="space-y-8 mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-start text-gray-800 mb-4">Hạng tài trợ</h2>
      {TIERS.map((tier) => {
        const benefitIds = benefits[tier.key].benefitIds;

        return (
          <div
            key={tier.key}
            className="border border-gray-200 p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-3 h-3 rounded-full ${tier.color}`}></div>
              <h3 className="font-semibold text-xl text-gray-900">{tier.name}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name={`minAmount-${tier.key}`}
                label="Số tiền tối thiểu (VNĐ)"
                size="lg"
                labelPlacement="outside"
                placeholder="VD: 500,000 VND"
                variant="bordered"
                value={
                  benefits[tier.key].minAmount
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        minimumFractionDigits: 0,
                      }).format(benefits[tier.key].minAmount)
                    : ""
                }
                onChange={(e) => handleMinAmountChange(tier.key, e.target.value)}
                className="w-full"
                errorMessage={errors[`minAmount-${tier.key}`]}
                isInvalid={!!errors[`minAmount-${tier.key}`]}
              />
              <div className="w-full">
                <Select
                  label="Quyền lợi"
                  size="lg"
                  labelPlacement="outside"
                  variant="bordered"
                  placeholder="Chọn quyền lợi"
                  selectionMode="multiple"
                  selectedKeys={new Set(benefitIds)}
                  onSelectionChange={(keys) => handlePerksChange(tier.key, keys as Set<string>)}
                  className="w-full"
                  errorMessage={errors[`benefitIds-${tier.key}`]}
                  isInvalid={!!errors[`benefitIds-${tier.key}`]}
                >
                  {benefitOptions.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {benefitIds.map((benefitId) => {
                const benefit = benefitData.find((b: EventBenefit) => b.id === benefitId);
                return (
                  benefit && (
                    <Chip
                      key={benefit.id}
                      color="primary"
                      variant="flat"
                      onClose={() =>
                        handlePerksChange(
                          tier.key,
                          new Set(benefitIds.filter((id) => id !== benefit.id))
                        )
                      }
                      className="bg-blue-100 text-blue-800"
                    >
                      {benefit.title || "Unknown"}
                    </Chip>
                  )
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}