Feature: Settings

  Background: Prepared database and logged user
    Given the database with some attendance states
    And the logged user

  @settings @ui_only @fast.row1.1
  Scenario: Changing the default attendance state persists after reload
    When user sets the default attendance state to "abcd" in settings
    Then the default attendance state is "abcd" after a reload

  @settings @ui_only
  Scenario: Changing the excused attendance state persists after reload
    When user sets the excused attendance state to "abcd" in settings
    Then the excused attendance state is "abcd" after a reload
