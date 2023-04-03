# About
Although ⟪Snag That Flag⟫ is extremely similar to ⟪2 Player Tag⟫, there are still some differences. Here are them:

## I. Game Rules
The original game is "tag," and the tag player is indicated by labling "tag" on top. When the time is up, the non-tag player wins. However, in ⟪Snag That Flag⟫, there are three game modes, Classic, Reverse, and Coin Master.

=== "Classic"
	The classic game rule. Win by owning the flag when the level ends. To quote the description of this setting in-game:

	!!! quotepro "經典模式，遊戲的預設規則。在每關的時間結束以前持有旗子，即可獲勝。此規則適用於所有關卡。"

=== "Reverse"
	The opposite of Classic. Win by not owning the flag when the level ends. To quote the description of this setting in-game:

	!!! quotepro "相反模式，與遊戲的預設規則相反。在每關的時間結束以前不持有旗子，即可獲勝。此規則適用於所有關卡。"

=== "Coin Master"
	A special game mode. Players would collect randomly-spawned coins in the level. This game mode only applies every level except "Category A Levels". To quote the description of this setting in-game:

	!!! quotepro "Coin Master 模式，在有限的時間內，收集最多的金幣。持有旗子的玩家可以額外獲得五成金幣。此規則僅適用於特定關卡。"

## II. Settings

The game is highly customisable. Before you start the game, you can choose either to use a preset settings or edit the default setting by yourself.

=== "Preset Settings"
    There are currently 5 preset settings available. Loading custom presets are also supported.

    | Name | Description |
    | --- | --- |
    | Previous | The previous custom settings. If no custom settings had been made before, this option is hidden. |
    | Flag Thief | The default setting. |
    | Speedrun | Modified from "Flag Thief," the only difference being that every level only takes 10 seconds. |
    | Entrepreneur | The recommeneded setting when playing "Coin Master." |
    | Square Chasing | Play in enourmous maps. |

    !!! info "You can save custom presets by following the steps below."
        1. Click「複製資料夾位址」.
        1. Paste it into your File Explorer and go back a folder (`Presets`).
        1. Copy "`PreviousSettings.json`," paste the file into "`Custom`," and rename it. A Chinese name for the file works best.
        1. Go back to the game and hit「重新整理」.
        1. Your custom preset will be loaded.

=== "Customised Settings"
    If none of the presets appeal to you, you may try customising the settings by yourself.

    !!! info "Blank titles mean same as previous."

    | Title       | Name             | Function                                                         |
    | ---------- | ---------------- | ------------------------------------------------------------ |
    | Game Mode   | Classic         | Check "**[I. Game Rules](#i-game-rules)**."                  |
    |            | Reverse         | Check "**[I. Game Rules](#i-game-rules)**."                  |
    |            | Coin Master | Check "**[I. Game Rules](#i-game-rules)**."          |
    | Level Selection   | All / None     | Enable / Disable all levels in the category.                       |
    |            | Up / Down           | Two pages, up and down. "Up" contains "Category A Levels," while "Down" contains "Category B and C Levels." Note that when Coin Master mode is in use, "Category A Levels" are always disabled. |
    | Level Settings   | Level Length         | Duration of every level. The range is 10 to 30 seconds.                           |
    | Player Settings   | Move Speed         | Speed of both players. The range is 1 to 1.5 times. Note that a speed boost of 1.2 is applied to the player with the flag. |
    |            | Continuous Jumping         | The player can jump in the air `n-1` times if this setting is set to `n`. |
    |            | Bounciness         | A boolean. 0 means disabled, 1 means enabled.           |
    | Time Orb Settings | Spawn Rate         | The spawn rate of the time orb in "Category B and C Levels." The range is 0% to 100%. This setting is also used on spawning coins during Coin Master mode. |
    |            | Affected Seconds         | The seconds affected each time a time orb is collected. Check "**[III. Collectibles](#iii-collectibles)**", "Time Orb" for details. This setting is disabled when Coin Master mode is in use. |

## III. Collectibles
There were no collectibles in the original game.

| Name     | Function                                                         | Limitations                                                         |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Time Orb   | Affects the time when collected. The flag-holder would want the level to end quicker, and the one without would not. Therefore time is reduced when the flag-holder collects the time orb and vice versa. The seconds affected can be set before starting the game. | Only appears in "Category B and C Levels." To ensure best experience while gaming, after a certain period, no more seconds can be added. |
| Coin     | Collect to increase the amount of coins. Check "**[V. Scoring](#v-scoring)**" about how coins are calculated. | Only spawns in Coin Master mode.                             |
| Bullet     | The player is stunned for 3 seconds upon collecting it.                       | Originally appears exclusively in `L9: Boss Level`. After the 1120311 upadte, it spawns with very low chance in every levels of "Category B and C Levels." |
| Faucet   | Changes the water level.                                               | Exclusive to `L5: Water 2`.                                    |
| Invert Controls     | As the name suggests.                                               | Exclusive to `L8: Invert`                                    |
| Swap     | Players swap positions.                                       | Exclusive to "Category C Levels."                                       |
| Random Teleportation | Only spawns in the bottom of the level. Teleports the player to the top of the level upon collected. | Exclusive to "Category C Levels."                                       |
| Boost     | Speed Boost and Jump Boost.                                     | Exclusive to `L15: Square`                                   |

## IV. Level-Exclusive Mechanics

| First Appeared In | Name     | Description                                                         |
| ------------------ | -------- | ------------------------------------------------------------ |
| `L2: Pirateship 1` | Spring Pad     | Bounces the player high up. Originally exclusive, now appears in many other levels.  |
|  | Sail     | The colour of the sail indicates the cyrrently leading player. Exclusive to Pirateship levels. |
| `L3: Water 1`     | Water       | Click the jump button to "swim." Exclusive to Water levels. |
| `L4: Teleporter 1`. | Teleporter   | Teleports the player to the corresponding exit. Exclusive to Teleporter levels. |
| `L5: Water 2`     | Faucet   | Check "**[III. Collectibles](#iii-collectibles)**", "Faucet."        |
| `L7: Stairs`     | Stairs     | The stairs rise up and the player has to keep moving down. The flag is switched or double amount of time orb time is deducted when a player touches the top or bottom. |
| `L9: Boss 1`  | Bullet     | Check "**[III. Collectibles](#iii-collectibles)**", "Bullet." |
| `Boss 2`      | Laser   | Boss shoots laser beams to attack players; same damage as the top and bottom part in `L9: Stairs`.                  |
| `Lava`         | Lava     | Rises to and fro from the bottom to the middle of the mountain. Teleports the player to the mountain peak if a player falls into the lava.             |
| `L8: Invert`     | Invert Controls     | Check "**[III. Collectibles](#iii-collectibles)**", "Invert Controls."          |
| `L14: Elevator`    | Swap     | Check "**[III. Collectibles](#iii-collectibles)**", "Swap."          |
|      | Random Teleportation | Check "**[III. Collectibles](#iii-collectibles)**", "Random Teleportation."      |
| `L15: Square`    | Boost     | Check "**[III. Collectibles](#iii-collectibles)**", "Boost."          |

## V. Scoring
??? "Details"
    ```c#
    int red = Player 1 score;
    int blu = Player 2 score;

    float diff = red - blu; // Difference between Player 1 and 2
    float goldenCond = (red + blu) * 0.2f; // Condition of Golden Crown
    int winMode = 3; // 0 Perfect Victory, 1 Win, 2 Nose Out, 3 Tie. Default is 3

    if (diff > 0)
    {
      winMode = diff > goldenCond ? (blu == 0 ? 0 : 1) : 2;
    }
    else if (Mathf.Abs(diff) > 0)
    {
      winMode = Mathf.Abs(diff) > goldenCond ? (red == 0 ? 0 : 1) : 2;
    }
    ```

| Win Mode        | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| Perfect Victory | When the opponent has 0 points and the winner has at least 1 point. |
| Win             | When the winner wins more than 20% of the total score.       |
| Nose Out        | When the winner wins less than 20% of the total score.       |
| Tie             | When both players have the same score.                       |

Players can score by:

=== "Classic"
	Owning the flag when the level ends.

=== "Reverse"
	Not owning the flag when the level ends.

=== "Coin Master"
	Coins can be calculated like this:

	??? "Details"
	    ```c#
	    int x = original; // The amount of coins the player originally have before starting this level
	    int y = thisLevel; // The amount of coins the player collected during this level
	    bool b = hasFlag; // Does the player own the flag?
	    int total = x + (int)(y * (b ? 1.5f : 1f));
	    ```

	The final amount of coins is equal to the original amount of coins plus the coins collected this round (times 1.5 if the player owns the flag).

	!!! info "Something worth noting"
		At the end of the level, it displays the winner by comparing the "raw amount of coins." But at the end of the game it compares the "final amount of coins," including flag buffs.