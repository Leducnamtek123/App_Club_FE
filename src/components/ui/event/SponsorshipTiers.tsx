"use client";

import { EventBenefit, SponsorshipTierDTO } from "@/lib/model/type";
import { Chip, Select, SelectItem, Input } from "@heroui/react";
import { useState, useEffect, useMemo } from "react";

const TIERS = [
  { name: "Kim cương", key: "diamond", color: "bg-gradient-to-r from-purple-500 to-blue-500" },
  { name: "Vàng", key: "platinum", color: "bg-gradient-to-r from-yellow-400 to-orange-500" },
  { name: "Bạc", key: "gold", color: "bg-gradient-to-r from-gray-300 to-gray-500" },
  { name: "Đồng", key: "silver", color: "bg-gradient-to-r from-orange-300 to-red-400" },
];

interface SponsorshipTiersProps {
  sponsorshipTiers: SponsorshipTierDTO[] | undefined;
  setSponsorshipTiers: (tiers: SponsorshipTierDTO[]) => void;
  benefitData: EventBenefit[];
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

export default function SponsorshipTiers({
  sponsorshipTiers,
  setSponsorshipTiers,
  benefitData,
  errors,
  setErrors,
}: SponsorshipTiersProps) {
  const [benefits, setBenefits] = useState<Record<string, { minAmount: number; benefitIds: string[] }>>(() => {
    const initialBenefits: Record<string, { minAmount: number; benefitIds: string[] }> = {};
    TIERS.forEach(tier => {
      const existingTier = sponsorshipTiers?.find(t => t.name === tier.name);
      initialBenefits[tier.key] = {
        minAmount: existingTier?.minAmount ? parseFloat(existingTier.minAmount.toString()) : 0,
        benefitIds: existingTier?.benefits?.map(benefit => benefit.id) || [],
      };
    });
    return initialBenefits;
  });

  useEffect(() => {
    const newErrors: Record<string, string> = { ...errors };

    const diamondAmount = benefits["diamond"].minAmount;
    const platinumAmount = benefits["platinum"].minAmount;
    const goldAmount = benefits["gold"].minAmount;
    const silverAmount = benefits["silver"].minAmount;

    TIERS.forEach(tier => delete newErrors[`minAmount-${tier.key}`]);

    if (silverAmount >= goldAmount && goldAmount > 0) {
      newErrors["minAmount-silver"] = "Số tiền tối thiểu của Đồng phải nhỏ hơn Bạc.";
      newErrors["minAmount-gold"] = "Số tiền tối thiểu của Bạc phải lớn hơn Đồng.";
    }
    if (goldAmount >= platinumAmount && platinumAmount > 0) {
      newErrors["minAmount-gold"] = "Số tiền tối thiểu của Bạc phải nhỏ hơn Vàng.";
      newErrors["minAmount-platinum"] = "Số tiền tối thiểu của Vàng phải lớn hơn Bạc.";
    }
    if (platinumAmount >= diamondAmount && diamondAmount > 0) {
      newErrors["minAmount-platinum"] = "Số tiền tối thiểu của Vàng phải nhỏ hơn Kim cương.";
      newErrors["minAmount-diamond"] = "Số tiền tối thiểu của Kim cương phải lớn hơn Vàng.";
    }

    setErrors(newErrors);
  }, [benefits, setErrors]);

  useEffect(() => {
    const updatedTiers: SponsorshipTierDTO[] = TIERS.map(tier => ({
      id: sponsorshipTiers?.find(t => t.name === tier.name)?.id || "",
      name: tier.name,
      minAmount: benefits[tier.key].minAmount.toString(),
      sponsorBenefitIds: benefits[tier.key].benefitIds,
      createdAt: sponsorshipTiers?.find(t => t.name === tier.name)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      event: sponsorshipTiers?.find(t => t.name === tier.name)?.event || null,
      benefits: benefitData.filter(b => benefits[tier.key].benefitIds.includes(b.id)),
    }));
    setSponsorshipTiers(updatedTiers);
  }, [benefits, setSponsorshipTiers, benefitData]);

  const benefitOptions = useMemo(() => {
    return benefitData.map(benefit => ({
      key: benefit.id,
      label: benefit.title || "Unknown",
    }));
  }, [benefitData]);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleMinAmountChange = (tierKey: string, value: string) => {
    const cleanValue = value.replace(/[^\d]/g, "");
    const numberValue = cleanValue ? parseInt(cleanValue) : 0;

    setBenefits(prev => ({
      ...prev,
      [tierKey]: {
        ...prev[tierKey],
        minAmount: numberValue,
      },
    }));
  };

  const handlePerksChange = (tierKey: string, keys: Set<string>) => {
    const benefitIds = Array.from(keys);

    setBenefits(prev => ({
      ...prev,
      [tierKey]: {
        ...prev[tierKey],
        benefitIds,
      },
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
                placeholder="VD: 500,000"
                variant="bordered"
                value={benefits[tier.key].minAmount ? formatNumber(benefits[tier.key].minAmount) : ""}
                onChange={(e) => handleMinAmountChange(tier.key, e.target.value)}
                className="w-full"
                endContent={<span className="text-gray-500">đ</span>}
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