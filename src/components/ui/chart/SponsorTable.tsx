'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
} from '@heroui/react';

const SponsorTable = ({ sponsors, meta, onPageChange }) => {
  return (
    <div className="p-4">
      <Table
        aria-label="Bảng xếp hạng nhà tài trợ"
        classNames={{
          base: 'max-w-3xl',
          table: 'min-w-full',
          wrapper: 'rounded-lg shadow-md bg-white',
          th: 'bg-gray-100 text-gray-600 font-semibold',
          td: 'text-gray-700',
        }}
        isStriped
        topContent={
          <h3 className="text-lg font-semibold text-gray-800">
            Xếp hạng nhà tài trợ
          </h3>
        }
      >
        <TableHeader>
          <TableColumn>Xếp hạng</TableColumn>
          <TableColumn allowsSorting>Tên nhà tài trợ</TableColumn>
          <TableColumn allowsSorting>Số tiền (VND)</TableColumn>
          <TableColumn>Số sự kiện</TableColumn>
        </TableHeader>
        <TableBody>
          {sponsors && sponsors.length > 0 ? (
            sponsors.map((sponsor, index) => (
              <TableRow key={sponsor.sponsorId}>
                <TableCell>{(meta.page - 1) * meta.take + index + 1}</TableCell>
                <TableCell>{sponsor.sponsorName}</TableCell>
                <TableCell>{Number(sponsor.totalAmount).toLocaleString()}</TableCell>
                <TableCell>{sponsor.eventCount}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>Không có dữ liệu</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* HeroUI Pagination */}
      {meta && meta.pageCount > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            page={meta.page}
            total={meta.pageCount}
            onChange={(newPage) => onPageChange(newPage)}
            color="primary" // Assuming HeroUI supports a color prop
            showControls // Assuming this enables prev/next arrows
          />
        </div>
      )}
    </div>
  );
};

export default SponsorTable;