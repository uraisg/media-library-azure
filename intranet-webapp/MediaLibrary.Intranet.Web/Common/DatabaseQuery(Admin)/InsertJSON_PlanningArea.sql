Declare @JSONPlanningArea varchar(max);

SELECT @JSONPlanningArea = BulkColumn
FROM OPENROWSET (BULK 'C:\Internship\media-library-azure(Personal)\intranet-webapp\MediaLibrary.Intranet.Web\Common\Planning Area (Dashboard)\sample.json', SINGLE_CLOB) IMPORT
INSERT INTO dbo.PlanningArea
SELECT Id, geography::STPolyFromText(AreaPolygon, 4326) as AreaPolygon, RTRIM(LTRIM(PlanningAreaName)) as PlanningAreaName, RegionId
FROM OPENJSON(@JSONPlanningArea)
WITH (
	[Id] int,
	[AreaPolygon] varchar(max),
	[PlanningAreaName] char(100),
	[RegionId] int
);

SELECT * FROM dbo.PlanningArea;


