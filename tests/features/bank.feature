Feature: Bank account

  Background: Prepared database and logged user
    Given the database with user
    # pred prihlasenim - Prehled banku nacita hned po prihlaseni
    And the bank connection is turned off
    And the logged user

  # UI stage uz overuje totez z pohledu uzivatele (viz "Dashboard shows the disabled
  # bank connection" nize), duplicitni UI test stejne veci by jen prodlouzil sadu
  @bank @api_only @fast.row1.1
  Scenario: Bank connection is disabled in tests
    When user requests the bank statement
    Then the bank connection is reported as disabled

  @bank @ui_only
  Scenario: Dashboard shows the disabled bank connection
    When user opens the dashboard
    Then the dashboard shows that the bank connection is disabled
