Feature: Prepaid lectures and counters

  Background: Prepared database and logged user
    Given the database with some clients, groups, courses and attendance states
    And the logged user

  # vytvoreni predplacenych lekci a zmena pocitadla maji UI pruchod v @ui_only scenarich
  # nize (karta klienta/skupiny je jediny vstupni bod) - tady jen API stage
  @prepaid @api_only @fast.row1.1
  Scenario: Create prepaid lectures
    When user creates 2 prepaid lectures for "Rod Lukáš" in course "Kurz Slabika"
    Then the prepaid lectures are stored

  # UI formular ma zaskrtavatko platby pri predplacene lekci natvrdo disabled
  # (vzdy zaplaceno) - tenhle stav jde vynutit jen primym pozadavkem na API
  @prepaid @api_only
  Scenario: Prepaid lecture cannot be unpaid
    When user creates an unpaid prepaid lecture for "Rod Lukáš" in course "Kurz Slabika"
    Then the prepaid lecture is rejected

  @prepaid @api_only
  Scenario: Membership prepaid counter can be changed
    When user sets the prepaid counter of "Rodová Petra" in group "Slabika 1" to 4
    Then the prepaid counter of "Rodová Petra" in group "Slabika 1" is 4

  @prepaid @ui_only @fast.row1.1
  Scenario: Add prepaid lectures from the client card
    When user adds 2 prepaid lectures for "Rod Lukáš" in course "Kurz Slabika" from the card
    Then the card shows 2 prepaid lectures

  @prepaid @ui_only
  Scenario: Change the prepaid counter on the group card
    When user sets the prepaid counter of "Rodová Petra" on the card of group "Slabika 1" to 3
    Then the card of group "Slabika 1" shows prepaid counter 3 for "Rodová Petra"
