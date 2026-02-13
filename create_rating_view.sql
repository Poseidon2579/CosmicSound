-- Crear o reemplazar la vista de canciones con sus calificaciones promedio
CREATE OR REPLACE VIEW canciones_con_rating AS
SELECT 
    c.*,
    COALESCE(sub.avg_rating, 0) as avg_rating,
    COALESCE(sub.review_count, 0) as review_count
FROM canciones c
LEFT JOIN (
    SELECT 
        cancion_id,
        AVG(calificacion) as avg_rating,
        COUNT(*) as review_count
    FROM resenas
    GROUP BY cancion_id
) sub ON c.id = sub.cancion_id;

-- Dar permisos de lectura a la vista
GRANT SELECT ON canciones_con_rating TO anon, authenticated;
