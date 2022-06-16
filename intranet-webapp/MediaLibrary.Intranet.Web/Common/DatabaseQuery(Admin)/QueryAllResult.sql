--Retrieve all results
select * 
from PlanningArea pa, FileDetails fd
where pa.AreaPolygon.STContains(fd.AreaPoint) = 0;

--Find the location
select * 
from PlanningArea pa, FileDetails fd
where pa.AreaPolygon.STContains(fd.AreaPoint) = 0 and fd.FileId = 'o1uZrriYsKLDxiY8';

--Filter By Place
select * 
from PlanningArea pa, FileDetails fd
where pa.AreaPolygon.STContains(fd.AreaPoint) = 0 and pa.PlanningAreaName = 'BUKIT PANJANG';