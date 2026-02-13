-- Ver los géneros únicos y cuántas canciones tienen
SELECT genero, COUNT(*) 
FROM canciones 
GROUP BY genero 
ORDER BY COUNT(*) DESC;

-- Buscar duplicados por YouTube ID
SELECT youtube_id, COUNT(*)
FROM canciones
GROUP BY youtube_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 20;

-- Ver ejemplos de duplicados
SELECT * FROM canciones WHERE youtube_id IN (
  SELECT youtube_id FROM canciones GROUP BY youtube_id HAVING COUNT(*) > 1 LIMIT 5
);
