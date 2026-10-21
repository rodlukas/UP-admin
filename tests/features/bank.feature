Feature: Bank account

  Background: Prepared database
    Given the database with user

  # stav banky se nastavuje v kazdem scenari pred prihlasenim - Prehled nacita banku hned po nem
  @bank @api_only @fast.row1.1
  Scenario: Disabled bank connection is reported
    Given the bank connection is turned off
    And the logged user
    When user requests the bank statement
    Then the bank connection is reported as disabled

  @bank @api_only
  Scenario: Bank statement is returned with the rent price
    Given the bank reports balance 12000 CZK, rent 8000 CZK and a payment of 1500 CZK noted "Platba za lekce"
    And the logged user
    When user requests the bank statement
    Then the bank statement shows balance 12000 CZK, rent 8000 CZK and the payment "Platba za lekce"

  @bank @api_only
  Scenario: Rate-limited bank request is reported
    Given the bank answers with error status 409
    And the logged user
    When user requests the bank statement
    Then the bank reports the error "překročení intervalu pro dotazování"

  @bank @ui_only
  Scenario: Dashboard shows the disabled bank connection
    Given the bank connection is turned off
    And the logged user
    When user opens the dashboard
    Then the dashboard shows that the bank connection is disabled

  @bank @ui_only @fast.row1.1
  Scenario: Dashboard shows the balance and recent payments
    Given the bank reports balance 12000 CZK, rent 8000 CZK and a payment of 1500 CZK noted "Platba za lekce"
    And the logged user
    When user opens the dashboard
    Then the dashboard shows balance 12000 CZK and the payment "Platba za lekce" without a rent warning

  @bank @ui_only
  Scenario: Dashboard warns when the balance does not cover the rent
    Given the bank reports balance 5000 CZK, rent 8000 CZK and a payment of 1500 CZK noted "Platba za lekce"
    And the logged user
    When user opens the dashboard
    Then the dashboard warns that the balance does not cover the rent
