package com.increff.project.dao;

import com.increff.project.entity.SalesReportPojo;
import org.springframework.stereotype.Repository;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class SalesReportDAO extends AbstractDAO<SalesReportPojo> {

    public SalesReportDAO(){super(SalesReportPojo.class);}

    public List<SalesReportPojo> getAllPaginatedDailyReport(int page, int size)
    {return selectAllPaginated(page,size);}

    public List<Map<String, Object>> getAllData() {

        String jpql =
                "SELECT c.name, p.barcode, p.name, " +
                        "       SUM(oi.orderedQty), " +
                        "       SUM(oi.orderedQty * oi.sellingPrice) " +
                        "FROM OrderItemPojo oi, ProductPojo p, ClientPojo c " +
                        "WHERE p.id = oi.productId " +
                        "  AND p.clientId = c.id " +
                        "GROUP BY c.name, p.barcode, p.name";

        List<Object[]> results = em.createQuery(jpql, Object[].class)
                .getResultList();

        return results.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("clientName", row[0]);
                    map.put("barcode", row[1]);
                    map.put("productName", row[2]);
                    map.put("quantityOrdered", row[3]);
                    map.put("revenue", row[4]);
                    return map;
                })
                .collect(Collectors.toList());
    }


    public List<Map<String, Object>> getSalesReportByClient(String clientName)
    {
        String jpql =
                "SELECT c.name, p.barcode, p.name, " +
                        "       SUM(oi.orderedQty), " +
                        "       SUM(oi.orderedQty * oi.sellingPrice) " +
                        "FROM OrderItemPojo oi, ProductPojo p, ClientPojo c " +
                        "WHERE p.id = oi.productId " +
                        "  AND p.clientId = c.id " +
                        "  AND c.name = :clientName " +
                        "GROUP BY c.name, p.barcode, p.name";


        List<Object[]> results = em.createQuery(jpql, Object[].class)
                .setParameter("clientName", clientName.toLowerCase().trim())
                .getResultList();

        return results.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("clientName", row[0]);
                    map.put("barcode", row[1]);
                    map.put("productName", row[2]);
                    map.put("quantityOrdered", ((Number) row[3]).intValue());
                    map.put("revenue", ((Number) row[4]).doubleValue());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> findSalesByDateRange(
            ZonedDateTime startTime,
            ZonedDateTime endTime) {

        ZonedDateTime startUtc = startTime.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime endUtc   = endTime.withZoneSameInstant(ZoneOffset.UTC);

        String jpql =
                "SELECT c.name, p.barcode,p.name, SUM(oi.orderedQty), " +
                        "       SUM(oi.orderedQty * oi.sellingPrice) " +
                        "FROM OrderPojo o, OrderItemPojo oi, ProductPojo p, ClientPojo c " +
                        "WHERE o.id = oi.orderId " +
                        "  AND p.id = oi.productId " +
                        "  AND p.clientId = c.id " +
                        "  AND o.orderTime BETWEEN :startTime AND :endTime " +
                        "GROUP BY c.name,p.barcode, p.name " +
                        "ORDER BY c.name, p.name";


        List<Object[]> results =  em.createQuery(jpql, Object[].class)
                .setParameter("startTime", startUtc)
                .setParameter("endTime", endUtc)
                .getResultList();

        return results.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("clientName", row[0]);
                    map.put("barcode", row[1]);
                    map.put("productName", row[2]);
                    map.put("quantityOrdered", ((Number) row[3]).intValue());
                    map.put("revenue", ((Number) row[4]).doubleValue());
                    return map;
                })
                .collect(Collectors.toList());

    }
    public List<Map<String, Object>> findSalesByDateRangeAndClient(
            ZonedDateTime startDate,
            ZonedDateTime endDate,
            String clientName) {

        ZonedDateTime startUtc = startDate.withZoneSameInstant(ZoneOffset.UTC);
        ZonedDateTime endUtc   = endDate.withZoneSameInstant(ZoneOffset.UTC);

        String jpql =
                "SELECT c.name,p.barcode, p.name, SUM(oi.orderedQty), " +
                        "       SUM(oi.orderedQty * oi.sellingPrice) " +
                        "FROM OrderPojo o, OrderItemPojo oi, ProductPojo p, ClientPojo c " +
                        "WHERE o.id = oi.orderId " +
                        "  AND p.id = oi.productId " +
                        "  AND p.clientId = c.id " +
                        "  AND o.orderTime BETWEEN :startDate AND :endDate " +
                        "  AND LOWER(c.name) = LOWER(:clientName) " +
                        "GROUP BY c.name,p.barcode, p.name " +
                        "ORDER BY p.name";

        List<Object[]> results =  em.createQuery(jpql, Object[].class)
                .setParameter("startDate", startUtc)
                .setParameter("endDate", endUtc)
                .setParameter("clientName", clientName.trim())
                .getResultList();

        return results.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("clientName", row[0]);
                    map.put("barcode", row[1]);
                    map.put("productName", row[2]);
                    map.put("quantityOrdered", ((Number) row[3]).intValue());
                    map.put("revenue", ((Number) row[4]).doubleValue());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public void saveDaySalesReport(ZonedDateTime start, ZonedDateTime end)
    {
        SalesReportPojo entity = getDaySales(start,end);
        em.persist(entity);
    }


    public SalesReportPojo getDaySales(ZonedDateTime start, ZonedDateTime end) {

        String jpql =
                "SELECT COUNT(DISTINCT o.id), " +
                        "       COALESCE(SUM(oi.orderedQty), 0), " +
                        "       COALESCE(SUM(oi.orderedQty * oi.sellingPrice), 0) " +
                        "FROM OrderPojo o, OrderItemPojo oi " +
                        "WHERE o.id = oi.orderId " +
                        "AND o.orderTime >= :start " +
                        "AND o.orderTime < :end";

        Object[] result = em.createQuery(jpql, Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getSingleResult();

        SalesReportPojo entity = new SalesReportPojo();
        entity.setDate(start); // or LocalDate extracted from start
        entity.setInvoicedOrdersCount(((Number) result[0]).intValue());
        entity.setInvoicedItemsCount(((Number) result[1]).intValue());
        entity.setTotalRevenue(((Number) result[2]).doubleValue());
        return entity;
    }


}
