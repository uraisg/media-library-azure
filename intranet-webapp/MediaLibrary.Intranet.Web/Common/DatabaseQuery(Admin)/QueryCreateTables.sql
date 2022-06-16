CREATE TABLE AllActivity (
    [Id]           INT       NOT NULL,
    [ActivityType] VARCHAR(50) NULL,
    CONSTRAINT [PK_AllActivity] PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE DashboardActivity (
    [Id]               UNIQUEIDENTIFIER NOT NULL,
    [FileId]           VARCHAR (50)     NULL,
    [Email]            VARCHAR (320)    NULL,
    [ActivityDateTime] DATETIME         NULL,
    [Activity]         INT              NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [Activity] FOREIGN KEY ([Activity]) REFERENCES [AllActivity] ([Id])
);

CREATE TABLE FileDetails (
    [Id]           UNIQUEIDENTIFIER  NOT NULL,
    [FileId]       VARCHAR (50)      NULL,
    [FileSize]     DECIMAL (5, 2)    NULL,
    [AreaPoint]    [sys].[geography] NULL,
    [ThumbnailURL] VARCHAR(255)        NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE PlanningArea (
    [Id]               INT               NOT NULL,
    [AreaPolygon]      [sys].[geography] NULL,
    [PlanningAreaName] VARCHAR (100)     NULL,
    [RegionId]         INT               NULL,
    [CA_IND]           INT               NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE [Region] (
    [Id]         INT       NOT NULL,
    [RegionName] VARCHAR(50) NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);

CREATE TABLE DeletedFiles (
    [Id]                  UNIQUEIDENTIFIER  NOT NULL,
    [FileId]              VARCHAR (50)      NULL,
    [Name]                VARCHAR(255)        NULL,
    [Location]            VARCHAR(255)        NULL,
    [PlanningArea]        [sys].[geography] NULL,
    [Email]               VARCHAR (320)     NULL,
    [ActivityDateTime]    DATETIME          NULL,
    [DashboardActivityId] UNIQUEIDENTIFIER  NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [DashboardActivityId] FOREIGN KEY ([DashboardActivityId]) REFERENCES [DashboardActivity] ([Id])
);


