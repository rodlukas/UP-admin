Feature: Statistics

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  # obe nize overuji datovou spravnost /api/v1/stats/ (vcetne roku 1999, ktery SegmentedControl
  # v UI vubec nenabizi) - jen API stage
  @statistics @api_only @fast.row1.1
  Scenario: Statistics count clients and groups
    When user requests statistics
    Then the statistics show 5 clients (4 active) and 4 groups (3 active)

  @statistics @api_only
  Scenario: Statistics can be limited to a year
    Given a lecture of "Rodová Petra" in course "Kurz Slabika" at "2019-03-04", "10:00"
    When user requests statistics for year "2018"
    Then the statistics show 2 lectures
    When user requests statistics for year "2019"
    Then the statistics show 1 lectures
    When user requests statistics for year "1999"
    Then the statistics show 0 lectures

  @statistics @ui_only
  Scenario: Statistics page shows client and group totals
    When user opens the statistics page
    Then the statistics page shows 5 clients and 4 groups
