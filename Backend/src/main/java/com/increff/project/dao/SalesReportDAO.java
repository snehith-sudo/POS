package com.increff.project.dao;

import com.increff.project.entity.SalesReportPojo;
import com.increff.project.model.data.SalesReportData;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Repository;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class SalesReportDAO extends AbstractDAO<SalesReportPojo> {

    public SalesReportDAO(){
        super(SalesReportPojo.class);
    }

    // -------------------- JPQL QUERIES --------------------

    private static final String SALES_ALL =
            "SELECT c.name, p.barcode, p.name, " +
                    "SUM(oi.orderedQty), SUM(oi.orderedQty * oi.sellingPrice) " +
                    "FROM OrderItemPojo oi " +
                    "JOIN ProductPojo p ON p.id = oi.productId " +
                    "JOIN ClientPojo c ON c.id = p.clientId " +
                    "GROUP BY c.name, p.barcode, p.name " +
                    "ORDER BY SUM(oi.orderedQty * oi.sellingPrice) ASC";

    private static final String SALES_ALL_COUNT =
            "SELECT COUNT(DISTINCT p.barcode) " +
                    "FROM OrderItemPojo oi " +
                    "JOIN ProductPojo p ON p.id = oi.productId " +
                    "JOIN ClientPojo c ON c.id = p.clientId";


    private static final String SALES_BY_CLIENT =
            "SELECT c.name, p.barcode, p.name, " +
                    "SUM(oi.orderedQty), SUM(oi.orderedQty * oi.sellingPrice) " +
                    "FROM OrderItemPojo oi " +
                    "JOIN ProductPojo p ON p.id = oi.productId " +
                    "JOIN ClientPojo c ON c.id = p.clientId " +
                    "WHERE LOWER(c.name) = :clientName " +
                    "GROUP BY c.name, p.barcode, p.name";

    private static final String SALES_BY_CLIENT_COUNT =
            "SELECT COUNT(DISTINCT p.barcode) " +
                    "FROM OrderItemPojo oi " +
                    "JOIN ProductPojo p ON p.id = oi.productId " +
                    "JOIN ClientPojo c ON c.id = p.clientId " +
                    "WHERE LOWER(c.name) = :clientName";


    private static final String SALES_BY_DATE =
            "SELECT c.name, p.barcode, p.name, " +
                    "SUM(oi.orderedQty), SUM(oi.orderedQty * oi.sellingPrice) " +
                    "FROM OrderPojo o " +
                    "JOIN OrderItemPojo oi ON o.id = oi.orderId " +
                    "JOIN ProductPojo p ON p.id = oi.productId " +
                    "JOIN ClientPojo c ON c.id = p.clientId " +
                    "WHERE o.orderTime BETWEEN :startTime AND :endTime " +
                    "GROUP BY c.name, p.barcode, p.name " +
                    "ORDER BY c.name, p.name";

    private static final String SALES_BY_DATE_COUNT =
            "SELECT COUNT(DISTINCT p.barcode) " +
                    "FROM OrderPojo o " +
                    "JOIN OrderItemPojo oi ON o.id = oi.orderId " +
                    "JOIN ProductPojo p ON p.id = oi.productId " +
                    "JOIN ClientPojo c ON c.id = p.clientId " +
                    "WHERE o.orderTime BETWEEN :startTime AND :endTime";


    private static final String SALES_BY_DATE_CLIENT =
            "SELECT c.name, p.barcode, p.name, " +
                    "SUM(oi.orderedQty), SUM(oi.orderedQty * oi.sellingPrice) " +
                    "FROM OrderPojo o " +
                    "JOIN OrderItemPojo oi ON o.id = oi.orderId " +
                    "JOIN ProductPojo p ON p.id = oi.productId " +
                    "JOIN ClientPojo c ON c.id = p.clientId " +
                    "WHERE o.orderTime BETWEEN :startDate AND :endDate " +
                    "AND LOWER(c.name) = LOWER(:clientName) " +
                    "GROUP BY c.name, p.barcode, p.name " +
                    "ORDER BY p.name";

    private static final String SALES_BY_DATE_CLIENT_COUNT =
            "SELECT COUNT(DISTINCT p.barcode) " +
                    "FROM OrderPojo o " +
                    "JOIN OrderItemPojo oi ON o.id = oi.orderId " +
                    "JOIN ProductPojo p ON p.id = oi.productId " +
                    "JOIN ClientPojo c ON c.id = p.clientId " +
                    "WHERE o.orderTime BETWEEN :startDate AND :endDate " +
                    "AND LOWER(c.name) = LOWER(:clientName)";


    private static final String DAILY_REPORT =
            "SELECT COUNT(DISTINCT o.id), " +
                    "COALESCE(SUM(oi.orderedQty),0), " +
                    "COALESCE(SUM(oi.orderedQty * oi.sellingPrice),0) " +
                    "FROM OrderPojo o JOIN OrderItemPojo oi ON o.id = oi.orderId " +
                    "WHERE o.orderTime >= :start AND o.orderTime < :end";

    // ------------------------------------------------------


    public List<SalesReportPojo> getAllPaginatedDailyReport(int pageNumber, int pageSize) {
        return selectPaged(pageNumber, pageSize, "date");
    }

    public List<SalesReportData> getAllData(int page, int size) {
        List<Object[]> results = em.createQuery(SALES_ALL, Object[].class)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();

        return salesDataMapper(results);
    }

    public long countRowsOfAllData() {
        return em.createQuery(SALES_ALL_COUNT, Long.class).getSingleResult();
    }


    public List<SalesReportData> getSalesReportByClient(String clientName,int page,int size) {
        List<Object[]> results = em.createQuery(SALES_BY_CLIENT, Object[].class)
                .setParameter("clientName", clientName.toLowerCase().trim())
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();

        return salesDataMapper(results);
    }

    public long countRowsByClient(String clientName){
        return em.createQuery(SALES_BY_CLIENT_COUNT, Long.class)
                .setParameter("clientName", clientName.toLowerCase().trim())
                .getSingleResult();
    }


    public List<SalesReportData> findSalesByDateRange(ZonedDateTime startTime, ZonedDateTime endTime, int page, int size) {

        ZonedDateTime startUtc = startTime.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime endUtc   = endTime.withZoneSameInstant(ZoneOffset.UTC);

        List<Object[]> results = em.createQuery(SALES_BY_DATE, Object[].class)
                .setParameter("startTime", startUtc)
                .setParameter("endTime", endUtc)
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();

        return salesDataMapper(results);
    }

    public long countRowsByDates(ZonedDateTime startTime, ZonedDateTime endTime) {

        ZonedDateTime startUtc = startTime.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime endUtc   = endTime.withZoneSameInstant(ZoneOffset.UTC);

        return em.createQuery(SALES_BY_DATE_COUNT, Long.class)
                .setParameter("startTime", startUtc)
                .setParameter("endTime", endUtc)
                .getSingleResult();
    }


    public List<SalesReportData> findSalesByDateRangeAndClient(ZonedDateTime startDate,
                                                               ZonedDateTime endDate,
                                                               String clientName,
                                                               int page,
                                                               int size) {

        ZonedDateTime startUtc = startDate.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime endUtc   = endDate.withZoneSameInstant(ZoneOffset.UTC);

        List<Object[]> results = em.createQuery(SALES_BY_DATE_CLIENT, Object[].class)
                .setParameter("startDate", startUtc)
                .setParameter("endDate", endUtc)
                .setParameter("clientName", clientName.trim())
                .setFirstResult(page * size)
                .setMaxResults(size)
                .getResultList();

        return salesDataMapper(results);
    }

    public long countRowsByDateClient(ZonedDateTime startDate, ZonedDateTime endDate, String clientName) {

        ZonedDateTime startUtc = startDate.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime endUtc   = endDate.withZoneSameInstant(ZoneOffset.UTC);

        return em.createQuery(SALES_BY_DATE_CLIENT_COUNT, Long.class)
                .setParameter("startDate", startUtc)
                .setParameter("endDate", endUtc)
                .setParameter("clientName", clientName.trim())
                .getSingleResult();
    }


    @NonNull
    private List<SalesReportData> salesDataMapper(List<Object[]> results) {
        return results.stream()
                .map(row -> {
                    SalesReportData data = new SalesReportData();
                    data.setClientName((String) row[0]);
                    data.setBarcode((String) row[1]);
                    data.setProductName((String) row[2]);
                    data.setQuantityOrdered(((Number) row[3]).intValue());
                    data.setRevenue(((Number) row[4]).doubleValue());
                    return data;
                })
                .collect(Collectors.toList());
    }


    public void saveDaySalesReport(ZonedDateTime start, ZonedDateTime end){
        SalesReportPojo entity = getDaySales(start,end);
        em.persist(entity);
    }


    public SalesReportPojo getDaySales(ZonedDateTime start, ZonedDateTime end) {

        Object[] result = em.createQuery(DAILY_REPORT, Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();

        SalesReportPojo entity = new SalesReportPojo();
        entity.setDate(start);
        entity.setInvoicedOrdersCount(((Number) result[0]).intValue());
        entity.setInvoicedItemsCount(((Number) result[1]).intValue());
        entity.setTotalRevenue(((Number) result[2]).doubleValue());
        return entity;
    }
}
