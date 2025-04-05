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
            sponsors?.map((sponsor, index) => (
              <TableRow key={sponsor.sponsorId}>
                <TableCell>{(meta.page - 1) * meta.take + index + 1}</TableCell>
                <TableCell>
                  {sponsor.sponsorName ? sponsor.sponsorName : 'Không có giá trị'}
                </TableCell>
                <TableCell>
                  {sponsor.totalAmount !== undefined && sponsor.totalAmount !== null
                    ? Number(sponsor.totalAmount).toLocaleString()
                    : 'Không có giá trị'}
                </TableCell>
                <TableCell>
                  {sponsor.eventCount !== undefined && sponsor.eventCount !== null
                    ? sponsor.eventCount
                    : 'Không có giá trị'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell>Không có dữ liệu</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
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
            color="primary"
            showControls
          />
        </div>
      )}
    </div>
  );
};

export default SponsorTable;