CREATE TABLE [dbo].[AllActivity] (
    [AActivityId]  INT          NOT NULL,
    [ActivityType] VARCHAR (50) NULL,
    CONSTRAINT [PK_AllActivity] PRIMARY KEY CLUSTERED ([AActivityId] ASC)
);

CREATE TABLE [Region] (
    [RegionId]   INT          NOT NULL,
    [RegionName] VARCHAR (50) NULL,
    CONSTRAINT [PK_Region] PRIMARY KEY CLUSTERED ([RegionId] ASC)
);

CREATE TABLE [DashboardActivity] (
    [DActivityId]      UNIQUEIDENTIFIER NOT NULL,
    [FileId]           VARCHAR (50)     NULL,
    [Email]            VARCHAR (320)    NULL,
    [ActivityDateTime] DATETIME         NULL,
    [Activity]         INT              NULL,
    CONSTRAINT [PK_DashboardActivity] PRIMARY KEY CLUSTERED ([DActivityId] ASC),
    CONSTRAINT [FK_DashboardActivity_AllActivity] FOREIGN KEY ([Activity]) REFERENCES [AllActivity] ([AActivityId])
);

GO
CREATE NONCLUSTERED INDEX [IX_DashboardActivity_Activity]
    ON [DashboardActivity]([Activity] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_DashboardActivity_ActivityDateTime]
    ON [DashboardActivity]([ActivityDateTime] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_DashboardActivity_Email]
    ON [DashboardActivity]([Email] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_DashboardActivity_FileId]
    ON [DashboardActivity]([FileId] ASC);

CREATE TABLE [FileDetails] (
    [FDetailsId]   UNIQUEIDENTIFIER  NOT NULL,
    [FileId]       VARCHAR (50)      NULL,
    [FileSize]     DECIMAL (5, 2)    NULL,
    [AreaPoint]    [sys].[geography] NULL,
    [ThumbnailURL] VARCHAR (255)     NULL,
    CONSTRAINT [PK_FileDetails] PRIMARY KEY CLUSTERED ([FDetailsId] ASC)
);

GO
CREATE NONCLUSTERED INDEX [IX_FileDetails_FileId]
    ON [FileDetails]([FileId] ASC);

CREATE TABLE [PlanningArea] (
    [PAreaId]          INT               NOT NULL,
    [AreaPolygon]      [sys].[geography] NULL,
    [PlanningAreaName] VARCHAR (100)     NULL,
    [RegionId]         INT               NULL,
    [CA_IND]           INT               NULL,
    CONSTRAINT [PK_PlanningArea] PRIMARY KEY CLUSTERED ([PAreaId] ASC),
    CONSTRAINT [FK_PlanningArea_Region] FOREIGN KEY ([RegionId]) REFERENCES [Region] ([RegionId])
);

GO
CREATE NONCLUSTERED INDEX [IX_PlanningArea_PlanningAreaName]
    ON [PlanningArea]([PlanningAreaName] ASC);

CREATE TABLE [DeletedFiles] (
    [DFilesId]            UNIQUEIDENTIFIER  NOT NULL,
    [FileId]              VARCHAR (50)      NULL,
    [Name]                VARCHAR (255)     NULL,
    [Location]            VARCHAR (255)     NULL,
    [PlanningArea]        [sys].[geography] NULL,
    [Email]               VARCHAR (320)     NULL,
    [ActivityDateTime]    DATETIME          NULL,
    [DashboardActivityId] UNIQUEIDENTIFIER  NULL,
    CONSTRAINT [PK_DeletedFiles] PRIMARY KEY CLUSTERED ([DFilesId] ASC),
    CONSTRAINT [FK_DeletedFiles_DashboardActivity] FOREIGN KEY ([DashboardActivityId]) REFERENCES [DashboardActivity] ([DActivityId])
);

GO
CREATE NONCLUSTERED INDEX [IX_DeletedFiles_ActivityDateTime]
    ON [DeletedFiles]([ActivityDateTime] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_DeletedFiles_DashboardActivityId]
    ON [DeletedFiles]([DashboardActivityId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_DeletedFiles_Email]
    ON [DeletedFiles]([Email] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_DeletedFiles_FileId]
    ON [DeletedFiles]([FileId] ASC);


