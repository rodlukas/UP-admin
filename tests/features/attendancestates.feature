Feature: Operations with attendance states

  Background: Prepared database and logged user
    Given the database with some attendance states
    And the logged user

  @add @attendancestates @fast.row<row.id>
  Scenario Outline: Add valid attendance state
    When user adds new attendance state "<name>" with visibility "<visible>"
    Then the attendance state is added

    Examples: Attendance states
      | name     | visible |
      | nepřišel | True    |
      | test     | False   |

  @add @attendancestates
  Scenario Outline: Add invalid attendance state
    When user adds new attendance state "<name>" with visibility "<visible>"
    Then the attendance state is not added

    Examples: Attendance states
      | name | visible |
      |      | True    |
      # duplicitni nazev stavu ucasti
      | OK   | False   |

  @edit @attendancestates
  Scenario: Edit attendance state
    When user updates the data of attendance state "OK" to name "OK - dorazil" and visibility "False"
    Then the attendance state is updated

  @delete @attendancestates
  Scenario Outline: Delete attendance state
    When user deletes the attendance state "<name>"
    Then the attendance state is deleted

    Examples: Attendance states
      | name    |
      | skryty  |
      | OK      |
