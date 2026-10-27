Feature: Reminding a client to pay for the next lecture

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  # remind_pay se v UI projevuje jen jako ikona (AttendanceRemindPay.tsx) bez vlastniho
  # ovladaciho prvku - staci overit vypocet primo pres API, jen API stage
  @remind_pay @api_only @fast.row1.1
  Scenario: A paid lecture with no upcoming paid lecture needs a reminder
    When user fetches the attendance of "Rodová Petra" at "2018-05-07", "20:00"
    Then the attendance needs a payment reminder

  @remind_pay @api_only
  Scenario: An unpaid lecture never needs a reminder
    When user fetches the attendance of "Rodová Petra" at "2018-05-07", "21:00"
    Then the attendance does not need a payment reminder

  @remind_pay @api_only
  Scenario: A group member with prepaid lectures left does not need a reminder
    When user adds a paid group lecture for "Slabika 4"
    And user sets the prepaid counter of "Rodová Petra" in group "Slabika 4" to 2
    Then the attendance of "Rodová Petra" in that lecture does not need a payment reminder

  @remind_pay @api_only
  Scenario: A group member without prepaid lectures left needs a reminder
    When user adds a paid group lecture for "Slabika 4"
    Then the attendance of "Rodová Petra" in that lecture needs a payment reminder
