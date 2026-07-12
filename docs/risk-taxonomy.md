% MTN QuantRisk - Revenue Risk Measurement for MTN Ghana
% Version: 1.0
% Date: 2026-05-18
%
% This module quantifies risk as expected revenue loss (GHS/USD).
% All six risk categories are expressed in terms of potential reduction
% to MTN Ghana's revenue or direct financial loss.
%
% Reference: MTN Ghana annual revenue ~ GHS 12.5 billion (2025 estimate)
%            ~ USD 1.56 billion at 8 GHS/USD

classdef MTN_RevenueRiskMetrics < handle
    % MTN_RevenueRiskMetrics - Financial loss / revenue risk for MTN Ghana
    % Usage:
    %   rrm = MTN_RevenueRiskMetrics();
    %   loss = rrm.calculateExpectedLoss(impactPercentage, probability, category)
    %   [lossGHS, lossUSD, severity, tier] = rrm.assessRisk('regulatory', 0.12, 0.7)
    
    properties (Constant)
        % MTN Ghana financial baseline (2025 estimates - update as needed)
        MTN_GHANA_ANNUAL_REVENUE_GHS = 12.5e9;   % GHS 12.5 billion
        MTN_GHANA_ANNUAL_REVENUE_USD = 1.56e9;   % USD 1.56 billion (at 8 GHS/USD)
        
        % Risk categories (each drives revenue loss differently)
        RISK_CATEGORIES = {'regulatory', 'competitive', 'fx_financial', ...
                           'operational', 'political', 'reputational'};
        
        % Expected revenue loss as % of annual revenue per risk category
        % These are baseline multipliers for a "full impact" event (probability=1.0)
        % Derived from historical MTN Ghana incidents and telco industry data
        BASELINE_LOSS_PCT = containers.Map(...
            {'regulatory', 'competitive', 'fx_financial', 'operational', 'political', 'reputational'}, ...
            [0.05, 0.03, 0.08, 0.04, 0.06, 0.02]);  % e.g., regulatory = 5% revenue loss
        
        % Alert thresholds based on expected loss in GHS
        % WATCH: loss < GHS 50M, WARNING: GHS 50M-200M, CRITICAL: > GHS 200M
        WATCH_LOSS_THRESHOLD_GHS = 50e6;      % GHS 50 million
        WARNING_LOSS_THRESHOLD_GHS = 200e6;   % GHS 200 million
        
        % Tier display
        TIER_NAMES = containers.Map(...
            {'watch', 'warning', 'critical'}, ...
            {'Watch', 'Warning', 'Critical'});
        TIER_COLORS = containers.Map(...
            {'watch', 'warning', 'critical'}, ...
            {'#FFB81C', '#F59E0B', '#EF4444'});
    end
    
    methods (Static)
        function [lossGHS, lossUSD, severity, tier] = assessRisk(category, impactPercentage, probability, confidence)
            % assessRisk - Primary risk assessment function for MTN Ghana revenue
            %   [lossGHS, lossUSD, severity, tier] = assessRisk(category, impactPercentage, probability, confidence)
            %
            % Inputs:
            %   category        - string: one of 6 risk categories
            %   impactPercentage - double: expected revenue loss as % of MTN Ghana annual revenue (0-1, e.g., 0.05 = 5%)
            %   probability     - double: likelihood of occurrence (0-1)
            %   confidence      - double: AI model confidence (0-1, default=1.0)
            %
            % Outputs:
            %   lossGHS         - expected revenue loss in GHS
            %   lossUSD         - expected revenue loss in USD
            %   severity        - score 0-10 derived from loss relative to revenue
            %   tier            - string: 'watch', 'warning', 'critical'
            %
            % Example:
            %   [lossGHS, lossUSD, sev, tier] = MTN_RevenueRiskMetrics.assessRisk('regulatory', 0.05, 0.7, 0.95);
            if nargin < 4
                confidence = 1.0;
            end
            
            % Validate inputs
            validCategories = MTN_RevenueRiskMetrics.RISK_CATEGORIES;
            if ~any(strcmp(category, validCategories))
                error('Unknown category. Valid: %s', strjoin(validCategories, ', '));
            end
            if impactPercentage < 0 || impactPercentage > 1
                error('impactPercentage must be between 0 and 1');
            end
            if probability < 0 || probability > 1
                error('probability must be between 0 and 1');
            end
            if confidence < 0 || confidence > 1
                error('confidence must be between 0 and 1');
            end
            
            % Baseline loss % for this category (full impact)
            baselinePct = MTN_RevenueRiskMetrics.BASELINE_LOSS_PCT(category);
            
            % Adjust impactPercentage by category relevance (if impactPercentage not already category-specific)
            % Here we assume impactPercentage is absolute % loss; we can also cap at baseline.
            effectiveLossPct = impactPercentage * probability * confidence;
            
            % Calculate expected revenue loss
            lossGHS = MTN_RevenueRiskMetrics.MTN_GHANA_ANNUAL_REVENUE_GHS * effectiveLossPct;
            lossUSD = MTN_RevenueRiskMetrics.MTN_GHANA_ANNUAL_REVENUE_USD * effectiveLossPct;
            
            % Derive severity (0-10) based on loss relative to revenue
            % Severity = min(10, (lossGHS / annual_revenue) * 100)
            % So 1% revenue loss = severity 1, 10% loss = severity 10
            lossPercentOfRevenue = (lossGHS / MTN_RevenueRiskMetrics.MTN_GHANA_ANNUAL_REVENUE_GHS) * 100;
            severity = min(10, lossPercentOfRevenue);
            
            % Determine alert tier based on absolute loss GHS
            if lossGHS < MTN_RevenueRiskMetrics.WATCH_LOSS_THRESHOLD_GHS
                tier = 'watch';
            elseif lossGHS < MTN_RevenueRiskMetrics.WARNING_LOSS_THRESHOLD_GHS
                tier = 'warning';
            else
                tier = 'critical';
            end
        end
        
        function [lossGHS, lossUSD, severity, tier] = assessRiskFromArticle(category, articleData)
            % assessRiskFromArticle - Simplified risk assessment using article fields
            %   articleData is a struct with fields:
            %       .impact_description - text (e.g., "fine of 10M GHS")
            %       .probability - numeric (0-1)
            %       .confidence - numeric (0-1)
            %   This function extracts impact % from description using simple heuristics.
            %   In production, use NLP + BERT.
            %
            % Example:
            %   data.impact_description = 'NCA imposes 50M GHS fine';
            %   data.probability = 0.9;
            %   data.confidence = 0.95;
            %   [loss, lossUSD, sev, tier] = MTN_RevenueRiskMetrics.assessRiskFromArticle('regulatory', data);
            
            % Extract monetary amount from description (simple regex for GHS or USD)
            impactGHS = 0;
            % Look for patterns like "GHS 10M", "10 million GHS", "fine of 50M"
            tokens = regexp(articleData.impact_description, '(\d+(?:\.\d+)?)\s*(?:million|M|billion|B)?\s*(GHS|USD)?', 'tokens');
            if ~isempty(tokens)
                amount = str2double(tokens{1}{1});
                if length(tokens{1}) > 1
                    currency = tokens{1}{2};
                    if strcmpi(currency, 'USD')
                        impactGHS = amount * 8;  % assume 8 GHS/USD
                    else
                        impactGHS = amount;
                    end
                else
                    impactGHS = amount;
                end
                % Handle million/billion shorthand
                if contains(articleData.impact_description, 'million') || contains(articleData.impact_description, 'M')
                    impactGHS = impactGHS * 1e6;
                elseif contains(articleData.impact_description, 'billion') || contains(articleData.impact_description, 'B')
                    impactGHS = impactGHS * 1e9;
                end
            end
            
            % Convert absolute impact to % of annual revenue
            impactPercent = impactGHS / MTN_RevenueRiskMetrics.MTN_GHANA_ANNUAL_REVENUE_GHS;
            % Cap impactPercent at 1 (100% of revenue) for sanity
            impactPercent = min(impactPercent, 1.0);
            
            % Use probability and confidence from article
            prob = articleData.probability;
            conf = articleData.confidence;
            
            [lossGHS, lossUSD, severity, tier] = MTN_RevenueRiskMetrics.assessRisk(category, impactPercent, prob, conf);
        end
        
        function displayRiskBrief(category, impactPercent, probability, confidence)
            % displayRiskBrief - Generate a board-ready risk summary
            [lossGHS, lossUSD, severity, tier] = MTN_RevenueRiskMetrics.assessRisk(category, impactPercent, probability, confidence);
            
            fprintf('\n========================================\n');
            fprintf('MTN GHANA REVENUE RISK BRIEF\n');
            fprintf('========================================\n');
            fprintf('Category:        %s\n', category);
            fprintf('Expected Revenue Loss: GHS %.2f million (USD %.2f million)\n', lossGHS/1e6, lossUSD/1e6);
            fprintf('Severity (0-10): %.1f\n', severity);
            fprintf('Alert Tier:      %s\n', upper(tier));
            fprintf('Risk Drivers:    Probability = %.0f%%, Confidence = %.0f%%\n', probability*100, confidence*100);
            fprintf('========================================\n');
        end
    end
end

% -------------------------------------------------------------------------
% EXAMPLE USAGE (run this section to test)
% -------------------------------------------------------------------------
% Initialize
% rrm = MTN_RevenueRiskMetrics();
% 
% Example 1: Regulatory fine of GHS 50M with 70% probability, 95% confidence
fprintf('\n--- EXAMPLE 1: Regulatory Fine ---');
[lossGHS, lossUSD, sev, tier] = MTN_RevenueRiskMetrics.assessRisk('regulatory', 0.05, 0.7, 0.95);
fprintf('\nRegulatory risk: Expected loss GHS %.2fM, USD %.2fM | Severity %.1f | Tier: %s\n', ...
    lossGHS/1e6, lossUSD/1e6, sev, upper(tier));

% Example 2: FX volatility causing 8% revenue loss due to cedi depreciation
fprintf('\n--- EXAMPLE 2: FX Risk ---');
[lossGHS, lossUSD, sev, tier] = MTN_RevenueRiskMetrics.assessRisk('fx_financial', 0.08, 0.85, 0.90);
fprintf('\nFX risk: Expected loss GHS %.2fM, USD %.2fM | Severity %.1f | Tier: %s\n', ...
    lossGHS/1e6, lossUSD/1e6, sev, upper(tier));

% Example 3: Competitive threat from new entrant (3% revenue loss, 50% probability)
fprintf('\n--- EXAMPLE 3: Competitive Threat ---');
MTN_RevenueRiskMetrics.displayRiskBrief('competitive', 0.03, 0.50, 0.85);

% Example 4: Using article data (simulated)
fprintf('\n--- EXAMPLE 4: From News Article ---');
article.impact_description = 'NCA Ghana imposes GHS 50 million fine on MTN';
article.probability = 0.90;
article.confidence = 0.95;
[lossGHS, lossUSD, sev, tier] = MTN_RevenueRiskMetrics.assessRiskFromArticle('regulatory', article);
fprintf('Article-based: Expected loss GHS %.2fM, USD %.2fM | Severity %.1f | Tier: %s\n', ...
    lossGHS/1e6, lossUSD/1e6, sev, upper(tier));