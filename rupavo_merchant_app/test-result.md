00:00 +0: loading D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart
00:00 +0: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:00 +0 -1: loading D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/order_test.dart [E]
  Failed to load "D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/order_test.dart":
  Compilation failed for testPath=D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/order_test.dart: test/helpers/test_helpers.dart:128:5: Error: No named parameter with the name 'bannerUrl'.
      bannerUrl: bannerUrl,
      ^^^^^^^^^
  lib/models/shop.dart:16:3: Context: Found this candidate, but the arguments don't match.
    Shop({
    ^^^^
  .
00:00 +0 -2: loading D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart [E]
  Error: The Dart compiler exited unexpectedly.
  package:flutter_tools/src/base/common.dart 34:3  throwToolExit
  package:flutter_tools/src/compile.dart 911:11    DefaultResidentCompiler._compile.<fn>
  dart:async/zone.dart 1538:47                     _rootRunUnary
  dart:async/zone.dart 1429:19                     _CustomZone.runUnary
  dart:async/future_impl.dart 948:45               Future._propagateToListeners.handleValueCallback
  dart:async/future_impl.dart 977:13               Future._propagateToListeners
  dart:async/future_impl.dart 862:9                Future._propagateToListeners
  dart:async/future_impl.dart 720:5                Future._completeWithValue
  dart:async/future_impl.dart 804:7                Future._asyncCompleteWithValue.<fn>
  dart:async/zone.dart 1525:13                     _rootRun
  dart:async/zone.dart 1422:19                     _CustomZone.run
  dart:async/zone.dart 1321:7                      _CustomZone.runGuarded
  dart:async/zone.dart 1362:23                     _CustomZone.bindCallbackGuarded.<fn>
  dart:async/schedule_microtask.dart 40:35         _microtaskLoop
  dart:async/schedule_microtask.dart 49:5          _startMicrotaskLoop
  dart:isolate-patch/isolate_patch.dart 127:13     _runPendingImmediateCallback
  dart:isolate-patch/isolate_patch.dart 194:5      _RawReceivePort._handleMessage
  
00:00 +0 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:00 +0 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/security/rls_test.dart: Supabase RLS Security Tests Shop Access Control user cannot read shops owned by other users
  Skip: Requires real Supabase instance with test users
00:00 +0 ~1 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:00 +0 ~1 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/security/rls_test.dart: Supabase RLS Security Tests Shop Access Control user cannot update shops owned by other users
  Skip: Requires real Supabase instance with test users
00:00 +0 ~2 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:00 +0 ~2 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/security/rls_test.dart: Supabase RLS Security Tests Shop Access Control user cannot delete shops owned by other users
  Skip: Requires real Supabase instance with test users
00:00 +0 ~3 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:00 +0 ~3 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/security/rls_test.dart: Supabase RLS Security Tests Product Access Control user cannot read products from shops they do not own
  Skip: Requires real Supabase instance with test users
00:00 +0 ~4 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:00 +0 ~4 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/security/rls_test.dart: Supabase RLS Security Tests Product Access Control user cannot create products in shops they do not own
  Skip: Requires real Supabase instance with test users
00:00 +0 ~5 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:00 +0 ~5 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/security/rls_test.dart: Supabase RLS Security Tests Order Access Control user cannot read orders from shops they do not own
  Skip: Requires real Supabase instance with test users
00:00 +0 ~6 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:00 +1 ~6 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:00 +2 ~6 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:01 +2 ~6 -2: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/login_screen_golden_test.dart: LoginScreen Golden Tests matches golden file - default state
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following TestFailure was thrown running a test:
Expected: one widget whose rasterized image matches golden image "goldens/login_screen_default.png"
  Actual: _TypeWidgetFinder:<Found 1 widget with type "LoginScreen": [
            LoginScreen(state: _LoginScreenState#ed88d),
          ]>
   Which: Could not be compared against non-existent file: "goldens/login_screen_default.png"

When the exception was thrown, this was the stack:
#0      fail (package:matcher/src/expect/expect.dart:149:31)
#1      _expect.<anonymous closure> (package:matcher/src/expect/expect.dart:125:9)
<asynchronous suspension>
<asynchronous suspension>
#8      expectLater.<anonymous closure> (package:flutter_test/src/widget_tester.dart:508:19)
<asynchronous suspension>
#9      main.<anonymous closure>.<anonymous closure> (file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/login_screen_golden_test.dart:26:7)
<asynchronous suspension>
#10     testWidgets.<anonymous closure>.<anonymous closure> (package:flutter_test/src/widget_tester.dart:192:15)
<asynchronous suspension>
#11     TestWidgetsFlutterBinding._runTestBody (package:flutter_test/src/binding.dart:1059:5)
<asynchronous suspension>
<asynchronous suspension>
(elided 7 frames from dart:async and package:stack_trace)

The test description was:
  matches golden file - default state
════════════════════════════════════════════════════════════════════════════════════════════════════
00:01 +2 ~6 -3: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:01 +2 ~6 -3: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/login_screen_golden_test.dart: LoginScreen Golden Tests matches golden file - default state [E]
  Test failed. See exception logs above.
  The test description was: matches golden file - default state
  
00:01 +2 ~6 -3: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/login_screen_golden_test.dart: LoginScreen Golden Tests matches golden file - dark mode
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following TestFailure was thrown running a test:
Expected: one widget whose rasterized image matches golden image "goldens/login_screen_dark.png"
  Actual: _TypeWidgetFinder:<Found 1 widget with type "LoginScreen": [
            LoginScreen(state: _LoginScreenState#a8b25),
          ]>
   Which: Could not be compared against non-existent file: "goldens/login_screen_dark.png"

When the exception was thrown, this was the stack:
#0      fail (package:matcher/src/expect/expect.dart:149:31)
#1      _expect.<anonymous closure> (package:matcher/src/expect/expect.dart:125:9)
<asynchronous suspension>
<asynchronous suspension>
#8      expectLater.<anonymous closure> (package:flutter_test/src/widget_tester.dart:508:19)
<asynchronous suspension>
#9      main.<anonymous closure>.<anonymous closure> (file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/login_screen_golden_test.dart:43:7)
<asynchronous suspension>
#10     testWidgets.<anonymous closure>.<anonymous closure> (package:flutter_test/src/widget_tester.dart:192:15)
<asynchronous suspension>
#11     TestWidgetsFlutterBinding._runTestBody (package:flutter_test/src/binding.dart:1059:5)
<asynchronous suspension>
<asynchronous suspension>
(elided 7 frames from dart:async and package:stack_trace)

The test description was:
  matches golden file - dark mode
════════════════════════════════════════════════════════════════════════════════════════════════════
00:01 +2 ~6 -4: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
00:01 +2 ~6 -4: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/login_screen_golden_test.dart: LoginScreen Golden Tests matches golden file - dark mode [E]
  Test failed. See exception logs above.
  The test description was: matches golden file - dark mode
  
00:01 +2 ~6 -4: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following TestFailure was thrown running a test:
Expected: one widget whose rasterized image matches golden image "goldens/dashboard_home_light.png"
  Actual: _TypeWidgetFinder:<Found 1 widget with type "DashboardScreen": [
            DashboardScreen(state: _DashboardScreenState#e8ddd),
          ]>
   Which: Could not be compared against non-existent file: "goldens/dashboard_home_light.png"

When the exception was thrown, this was the stack:
#0      fail (package:matcher/src/expect/expect.dart:149:31)
#1      _expect.<anonymous closure> (package:matcher/src/expect/expect.dart:125:9)
<asynchronous suspension>
<asynchronous suspension>
#8      expectLater.<anonymous closure> (package:flutter_test/src/widget_tester.dart:508:19)
<asynchronous suspension>
#9      main.<anonymous closure>.<anonymous closure> (file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart:40:7)
<asynchronous suspension>
#10     testWidgets.<anonymous closure>.<anonymous closure> (package:flutter_test/src/widget_tester.dart:192:15)
<asynchronous suspension>
#11     TestWidgetsFlutterBinding._runTestBody (package:flutter_test/src/binding.dart:1059:5)
<asynchronous suspension>
<asynchronous suspension>
(elided 7 frames from dart:async and package:stack_trace)

The test description was:
  matches golden file - home tab light mode
════════════════════════════════════════════════════════════════════════════════════════════════════
00:01 +2 ~6 -5: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab light mode [E]
  Test failed. See exception logs above.
  The test description was: matches golden file - home tab light mode
  
00:01 +2 ~6 -5: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab dark mode
00:01 +2 ~6 -6: loading D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/product_test.dart [E]
  Failed to load "D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/product_test.dart":
  Compilation failed for testPath=D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/product_test.dart: test/helpers/test_helpers.dart:128:5: Error: No named parameter with the name 'bannerUrl'.
      bannerUrl: bannerUrl,
      ^^^^^^^^^
  lib/models/shop.dart:16:3: Context: Found this candidate, but the arguments don't match.
    Shop({
    ^^^^
  .
00:01 +2 ~6 -6: loading D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart [E]
  Error: The Dart compiler exited unexpectedly.
  package:flutter_tools/src/base/common.dart 34:3  throwToolExit
  package:flutter_tools/src/compile.dart 911:11    DefaultResidentCompiler._compile.<fn>
  dart:async/zone.dart 1538:47                     _rootRunUnary
  dart:async/zone.dart 1429:19                     _CustomZone.runUnary
  dart:async/future_impl.dart 948:45               Future._propagateToListeners.handleValueCallback
  dart:async/future_impl.dart 977:13               Future._propagateToListeners
  dart:async/future_impl.dart 862:9                Future._propagateToListeners
  dart:async/future_impl.dart 720:5                Future._completeWithValue
  dart:async/future_impl.dart 804:7                Future._asyncCompleteWithValue.<fn>
  dart:async/zone.dart 1525:13                     _rootRun
  dart:async/zone.dart 1422:19                     _CustomZone.run
  dart:async/zone.dart 1321:7                      _CustomZone.runGuarded
  dart:async/zone.dart 1362:23                     _CustomZone.bindCallbackGuarded.<fn>
  dart:async/schedule_microtask.dart 40:35         _microtaskLoop
  dart:async/schedule_microtask.dart 49:5          _startMicrotaskLoop
  dart:isolate-patch/isolate_patch.dart 127:13     _runPendingImmediateCallback
  dart:isolate-patch/isolate_patch.dart 194:5      _RawReceivePort._handleMessage
  
00:01 +2 ~6 -6: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab dark mode
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following TestFailure was thrown running a test:
Expected: one widget whose rasterized image matches golden image "goldens/dashboard_home_dark.png"
  Actual: _TypeWidgetFinder:<Found 1 widget with type "DashboardScreen": [
            DashboardScreen(state: _DashboardScreenState#26d81),
          ]>
   Which: Could not be compared against non-existent file: "goldens/dashboard_home_dark.png"

When the exception was thrown, this was the stack:
#0      fail (package:matcher/src/expect/expect.dart:149:31)
#1      _expect.<anonymous closure> (package:matcher/src/expect/expect.dart:125:9)
<asynchronous suspension>
<asynchronous suspension>
#8      expectLater.<anonymous closure> (package:flutter_test/src/widget_tester.dart:508:19)
<asynchronous suspension>
#9      main.<anonymous closure>.<anonymous closure> (file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart:57:7)
<asynchronous suspension>
#10     testWidgets.<anonymous closure>.<anonymous closure> (package:flutter_test/src/widget_tester.dart:192:15)
<asynchronous suspension>
#11     TestWidgetsFlutterBinding._runTestBody (package:flutter_test/src/binding.dart:1059:5)
<asynchronous suspension>
<asynchronous suspension>
(elided 7 frames from dart:async and package:stack_trace)

The test description was:
  matches golden file - home tab dark mode
════════════════════════════════════════════════════════════════════════════════════════════════════
00:01 +2 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/golden/dashboard_screen_golden_test.dart: DashboardScreen Golden Tests matches golden file - home tab dark mode [E]
  Test failed. See exception logs above.
  The test description was: matches golden file - home tab dark mode
  
00:03 +2 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/shop_test.dart: Shop fromJson should create Shop from valid JSON
00:03 +3 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/shop_test.dart: Shop fromJson should handle null optional fields
00:03 +4 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/shop_test.dart: Shop fromJson should parse timestamps correctly
00:03 +5 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/shop_test.dart: Shop toJson should serialize Shop to JSON with all fields
00:03 +6 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/unit/models/shop_test.dart: Shop toInsertJson should not include id and owner_id in insert JSON
00:03 +7 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should display navigation bar with 4 destinations
00:04 +8 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should display navigation bar with 4 destinations
00:04 +9 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget_test.dart: App starts and shows login screen
00:04 +10 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget_test.dart: App starts and shows login screen
00:04 +10 ~6 -7: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/login_screen_test.dart: LoginScreen should display Google sign-in button
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following TestFailure was thrown running a test:
Expected: exactly one matching candidate
  Actual: _TypeWidgetFinder:<Found 0 widgets with type "ElevatedButton": []>
   Which: means none were found but one was expected

When the exception was thrown, this was the stack:
#4      main.<anonymous closure>.<anonymous closure> (file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/login_screen_test.dart:32:7)
<asynchronous suspension>
#5      testWidgets.<anonymous closure>.<anonymous closure> (package:flutter_test/src/widget_tester.dart:192:15)
<asynchronous suspension>
#6      TestWidgetsFlutterBinding._runTestBody (package:flutter_test/src/binding.dart:1059:5)
<asynchronous suspension>
<asynchronous suspension>
(elided one frame from package:stack_trace)

This was caught by the test expectation on the following line:
  file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/login_screen_test.dart line 32
The test description was:
  should display Google sign-in button
════════════════════════════════════════════════════════════════════════════════════════════════════
00:04 +10 ~6 -8: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget_test.dart: App starts and shows login screen
00:04 +10 ~6 -8: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/login_screen_test.dart: LoginScreen should display Google sign-in button [E]
  Test failed. See exception logs above.
  The test description was: should display Google sign-in button
  
00:04 +11 ~6 -8: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget_test.dart: App starts and shows login screen
00:04 +12 ~6 -8: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget_test.dart: App starts and shows login screen
00:04 +13 ~6 -8: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should have logout button in AppBar
00:04 +13 ~6 -8: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/login_screen_test.dart: LoginScreen button should be tappable
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following TestFailure was thrown running a test:
Expected: exactly one matching candidate
  Actual: _TypeWidgetFinder:<Found 0 widgets with type "ElevatedButton": []>
   Which: means none were found but one was expected

When the exception was thrown, this was the stack:
#4      main.<anonymous closure>.<anonymous closure> (file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/login_screen_test.dart:49:7)
<asynchronous suspension>
#5      testWidgets.<anonymous closure>.<anonymous closure> (package:flutter_test/src/widget_tester.dart:192:15)
<asynchronous suspension>
#6      TestWidgetsFlutterBinding._runTestBody (package:flutter_test/src/binding.dart:1059:5)
<asynchronous suspension>
<asynchronous suspension>
(elided one frame from package:stack_trace)

This was caught by the test expectation on the following line:
  file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/login_screen_test.dart line 49
The test description was:
  button should be tappable
════════════════════════════════════════════════════════════════════════════════════════════════════
00:04 +13 ~6 -9: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should have logout button in AppBar
00:04 +13 ~6 -9: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/login_screen_test.dart: LoginScreen button should be tappable [E]
  Test failed. See exception logs above.
  The test description was: button should be tappable
  
00:04 +14 ~6 -9: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/login_screen_test.dart: LoginScreen should have proper layout structure
00:04 +15 ~6 -9: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should show home screen by default
00:04 +16 ~6 -9: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should show home screen by default
00:04 +17 ~6 -9: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should display summary cards
00:05 +18 ~6 -9: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should display quick action cards
00:05 +19 ~6 -9: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should change page when navigation destination tapped
══╡ EXCEPTION CAUGHT BY WIDGETS LIBRARY ╞═══════════════════════════════════════════════════════════
The following assertion was thrown building KeyedSubtree-[GlobalKey#f1377]:
You must initialize the supabase instance before calling Supabase.instance
'package:supabase_flutter/src/supabase.dart':
Failed assertion: line 45 pos 7: '_instance._isInitialized'

The relevant error-causing widget was:
  Scaffold
  Scaffold:file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/lib/screens/dashboard_screen.dart:36:12

When the exception was thrown, this was the stack:
#2      Supabase.instance (package:supabase_flutter/src/supabase.dart:45:7)
#3      new _ProductListScreenState (package:rupavo_merchant_app/screens/product_list_screen.dart:16:30)
#4      ProductListScreen.createState (package:rupavo_merchant_app/screens/product_list_screen.dart:12:45)
#5      new StatefulElement (package:flutter/src/widgets/framework.dart:5905:60)
#6      StatefulWidget.createElement (package:flutter/src/widgets/framework.dart:779:38)
#7      Element.inflateWidget (package:flutter/src/widgets/framework.dart:4577:59)
#8      Element.updateChild (package:flutter/src/widgets/framework.dart:4053:20)
#9      ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#10     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#11     StatelessElement.update (package:flutter/src/widgets/framework.dart:5898:5)
#12     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#13     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#14     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#15     StatelessElement.update (package:flutter/src/widgets/framework.dart:5898:5)
#16     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#17     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#18     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#19     ProxyElement.update (package:flutter/src/widgets/framework.dart:6152:5)
#20     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#21     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#22     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#23     ProxyElement.update (package:flutter/src/widgets/framework.dart:6152:5)
#24     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#25     Element.updateChildren (package:flutter/src/widgets/framework.dart:4194:32)
#26     MultiChildRenderObjectElement.update (package:flutter/src/widgets/framework.dart:7302:17)
#27     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#28     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#29     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#30     ProxyElement.update (package:flutter/src/widgets/framework.dart:6152:5)
#31     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#32     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#33     StatefulElement.performRebuild (package:flutter/src/widgets/framework.dart:5985:11)
#34     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#35     StatefulElement.update (package:flutter/src/widgets/framework.dart:6010:5)
#36     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#37     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#38     StatefulElement.performRebuild (package:flutter/src/widgets/framework.dart:5985:11)
#39     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#40     StatefulElement.update (package:flutter/src/widgets/framework.dart:6010:5)
#41     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#42     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#43     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#44     ProxyElement.update (package:flutter/src/widgets/framework.dart:6152:5)
#45     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#46     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#47     StatefulElement.performRebuild (package:flutter/src/widgets/framework.dart:5985:11)
#48     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#49     StatefulElement.update (package:flutter/src/widgets/framework.dart:6010:5)
#50     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#51     SingleChildRenderObjectElement.update (package:flutter/src/widgets/framework.dart:7125:14)
#52     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#53     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#54     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#55     ProxyElement.update (package:flutter/src/widgets/framework.dart:6152:5)
#56     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#57     SingleChildRenderObjectElement.update (package:flutter/src/widgets/framework.dart:7125:14)
#58     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#59     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#60     StatefulElement.performRebuild (package:flutter/src/widgets/framework.dart:5985:11)
#61     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#62     StatefulElement.update (package:flutter/src/widgets/framework.dart:6010:5)
#63     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#64     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#65     StatefulElement.performRebuild (package:flutter/src/widgets/framework.dart:5985:11)
#66     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#67     StatefulElement.update (package:flutter/src/widgets/framework.dart:6010:5)
#68     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#69     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#70     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#71     ProxyElement.update (package:flutter/src/widgets/framework.dart:6152:5)
#72     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#73     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#74     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#75     ProxyElement.update (package:flutter/src/widgets/framework.dart:6152:5)
#76     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#77     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#78     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#79     ProxyElement.update (package:flutter/src/widgets/framework.dart:6152:5)
#80     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#81     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#82     StatefulElement.performRebuild (package:flutter/src/widgets/framework.dart:5985:11)
#83     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#84     StatefulElement.update (package:flutter/src/widgets/framework.dart:6010:5)
#85     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#86     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#87     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#88     ProxyElement.update (package:flutter/src/widgets/framework.dart:6152:5)
#89     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#90     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#91     StatefulElement.performRebuild (package:flutter/src/widgets/framework.dart:5985:11)
#92     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#93     StatefulElement.update (package:flutter/src/widgets/framework.dart:6010:5)
#94     Element.updateChild (package:flutter/src/widgets/framework.dart:4037:15)
#95     ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:5844:16)
#96     StatefulElement.performRebuild (package:flutter/src/widgets/framework.dart:5985:11)
#97     Element.rebuild (package:flutter/src/widgets/framework.dart:5532:7)
#98     BuildScope._tryRebuild (package:flutter/src/widgets/framework.dart:2750:15)
#99     BuildScope._flushDirtyElements (package:flutter/src/widgets/framework.dart:2807:11)
#100    BuildOwner.buildScope (package:flutter/src/widgets/framework.dart:3111:18)
#101    AutomatedTestWidgetsFlutterBinding.drawFrame (package:flutter_test/src/binding.dart:1506:19)
#102    RendererBinding._handlePersistentFrameCallback (package:flutter/src/rendering/binding.dart:495:5)
#103    SchedulerBinding._invokeFrameCallback (package:flutter/src/scheduler/binding.dart:1434:15)
#104    SchedulerBinding.handleDrawFrame (package:flutter/src/scheduler/binding.dart:1347:9)
#105    AutomatedTestWidgetsFlutterBinding.pump.<anonymous closure> (package:flutter_test/src/binding.dart:1335:9)
#108    TestAsyncUtils.guard (package:flutter_test/src/test_async_utils.dart:74:41)
#109    AutomatedTestWidgetsFlutterBinding.pump (package:flutter_test/src/binding.dart:1324:27)
#110    WidgetTester.pumpAndSettle.<anonymous closure> (package:flutter_test/src/widget_tester.dart:719:23)
#113    TestAsyncUtils.guard (package:flutter_test/src/test_async_utils.dart:74:41)
#114    WidgetTester.pumpAndSettle (package:flutter_test/src/widget_tester.dart:712:27)
#115    main.<anonymous closure>.<anonymous closure> (file:///D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart:105:20)
<asynchronous suspension>
#116    testWidgets.<anonymous closure>.<anonymous closure> (package:flutter_test/src/widget_tester.dart:192:15)
<asynchronous suspension>
#117    TestWidgetsFlutterBinding._runTestBody (package:flutter_test/src/binding.dart:1059:5)
<asynchronous suspension>
<asynchronous suspension>
(elided 7 frames from class _AssertionError, dart:async, and package:stack_trace)

════════════════════════════════════════════════════════════════════════════════════════════════════
00:05 +19 ~6 -10: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: DashboardScreen should change page when navigation destination tapped [E]
  Test failed. See exception logs above.
  The test description was: should change page when navigation destination tapped
  
00:05 +19 ~6 -10: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: HomeScreen summary cards should be wrapped in Card widgets
00:05 +20 ~6 -10: D:/Ivan/projects/rupavo-repo/rupavo_merchant_app/test/widget/screens/dashboard_screen_test.dart: HomeScreen quick actions should be in a Row
00:05 +21 ~6 -10: Some tests failed.
