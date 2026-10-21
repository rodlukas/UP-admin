Feature: Statistics

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  # obe nize overuji datovou spravnost /api/v1/stats/ (vcetne neexistujiciho roku 1999,
  # ktery SegmentedControl v UI vubec nenabizi) - jen API stage
  @statistics @api_only @fast.row1.1
  Scenario: Statistics counts match the database
    When user requests statistics
    Then the statistics counts match the database

  @statistics @api_only
  Scenario: Statistics can be limited to a year
    When user requests statistics for year "2018"
    Then the statistics show 2 lectures
    When user requests statistics for year "1999"
    Then the statistics show 0 lectures

  @statistics @ui_only
  Scenario: Statistics page shows client and group totals
    When user opens the statistics page
    Then the statistics page shows 5 clients and 4 groups
